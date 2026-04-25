import { Timestamp, addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, isSparkDemoMode } from './firebase';
import { isGuestStayRecordMatch, normalizeGuestLastName, normalizeGuestPhone } from './guestAccess';

export interface GuestSession {
  accessTokenId?: string;
  hotelId: string;
  stayId: string;
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
  expiresAt: string;
}

interface RedeemGuestAccessResponse {
  customToken: string;
  session: GuestSession;
}

interface CreateGuestOrderResponse {
  orderId: string;
  blockedWaUrl: string | null;
}

export interface CreateGuestOrderInput {
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
  items: unknown[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'room' | 'qris' | 'bank';
  selectedBank: string | null;
  hasPaymentProof: boolean;
}

interface DemoGuestStayRecord {
  hotelId?: string;
  roomNumber?: string;
  lastName?: string;
  lastNameNormalized?: string;
  phoneNumber?: string;
  phoneNumberNormalized?: string;
  checkedIn?: boolean;
  active?: boolean;
  status?: string;
}

const DEMO_SESSION_STORAGE_KEY = 'hcs_guest_demo_session';
const DEMO_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const DEMO_RATE_LIMIT_MAX = 3;

const redeemGuestAccessCallable = httpsCallable(functions, 'redeemGuestAccess');
const createGuestOrderCallable = httpsCallable(functions, 'createGuestOrder');
const revokeGuestSessionCallable = httpsCallable(functions, 'revokeGuestSession');

function persistDemoSession(session: GuestSession): void {
  window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearDemoSession(): void {
  window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
}

function getDemoSessionRateLimitKey(accessTokenId: string): string {
  return `hcs_guest_order_attempts_${accessTokenId}`;
}

function enforceDemoOrderRateLimit(accessTokenId: string): void {
  const now = Date.now();
  const storageKey = getDemoSessionRateLimitKey(accessTokenId);
  const raw = window.localStorage.getItem(storageKey);
  const attempts = raw ? (JSON.parse(raw) as number[]) : [];
  const freshAttempts = attempts.filter((timestamp) => now - timestamp < DEMO_RATE_LIMIT_WINDOW_MS);

  if (freshAttempts.length >= DEMO_RATE_LIMIT_MAX) {
    throw new Error('rate-limit');
  }

  freshAttempts.push(now);
  window.localStorage.setItem(storageKey, JSON.stringify(freshAttempts));
}

function normalizeDemoOrderItems(items: unknown[]): Array<Record<string, unknown>> {
  return items.map((item) => {
    const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const qty = typeof row.qty === 'number' && Number.isFinite(row.qty) ? row.qty : 0;
    const price = typeof row.price === 'number' && Number.isFinite(row.price) ? row.price : 0;

    return {
      id: row.id ?? null,
      name: typeof row.name === 'string' ? row.name : '',
      price,
      qty,
      note: typeof row.note === 'string' ? row.note : '',
      image: typeof row.image === 'string' ? row.image : '',
      description: typeof row.description === 'string' ? row.description : '',
      category: typeof row.category === 'string' ? row.category : '',
      tag: typeof row.tag === 'string' ? row.tag : '',
      allergens: typeof row.allergens === 'string' ? row.allergens : '',
    };
  }).filter((item) => item.name && item.qty > 0 && item.price >= 0);
}

async function createSparkDemoAccessToken(input: {
  hotelId: string;
  stayId: string;
  roomNumber: string;
  expiresAt: string;
}): Promise<string> {
  const tokenRef = await addDoc(collection(db, 'guest_access_tokens'), {
    hotelId: input.hotelId,
    stayId: input.stayId,
    roomNumber: input.roomNumber,
    status: 'active',
    mode: 'spark_demo',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(input.expiresAt)),
  });

  return tokenRef.id;
}

export function getAccessTokenFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('access');
}

export function scrubAccessTokenFromUrl(): void {
  const url = new URL(window.location.href);

  if (!url.searchParams.has('access')) {
    return;
  }

  url.searchParams.delete('access');
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, nextUrl);
}

export function loadStoredGuestSession(): GuestSession | null {
  const raw = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GuestSession;

    if (!parsed?.expiresAt || new Date(parsed.expiresAt).getTime() <= Date.now()) {
      clearDemoSession();
      return null;
    }

    return parsed;
  } catch {
    clearDemoSession();
    return null;
  }
}

async function redeemSparkDemoAccessSession(input: {
  accessToken: string;
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
}): Promise<GuestSession> {
  let tokenRef: ReturnType<typeof doc> | null = null;
  let tokenSnap: Awaited<ReturnType<typeof getDoc>> | null = null;
  let token: Record<string, unknown> | null = null;
  let stayId = '';

  if (input.accessToken.trim()) {
    tokenRef = doc(db, 'guest_access_tokens', input.accessToken.trim());
    tokenSnap = await getDoc(tokenRef);

    if (!tokenSnap.exists()) {
      throw new Error('invalid-token');
    }

    token = tokenSnap.data();
    const expiresAt = token.expiresAt?.toDate?.() ?? null;

    if (token.status !== 'active' || !expiresAt || expiresAt.getTime() <= Date.now()) {
      throw new Error('inactive-token');
    }

    stayId = String(token.stayId || '');
    if (!stayId) {
      throw new Error('invalid-stay');
    }
  }

  let staySnap = stayId ? await getDoc(doc(db, 'guest_stays', stayId)) : null;

  if (!staySnap || !staySnap.exists()) {
    const matchingStayQuery = query(
      collection(db, 'guest_stays'),
      where('roomNumber', '==', input.roomNumber.trim()),
    );
    const matchingStays = await getDocs(matchingStayQuery);

    const matchedStayDoc = matchingStays.docs.find((candidate) =>
      isGuestStayRecordMatch(candidate.data() as DemoGuestStayRecord, {
        roomNumber: input.roomNumber,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
      }),
    );

    if (!matchedStayDoc) {
      throw new Error('missing-stay');
    }

    staySnap = matchedStayDoc;
    stayId = matchedStayDoc.id;
  }

  const stay = staySnap.data() as DemoGuestStayRecord;

  if (
    !isGuestStayRecordMatch(stay, {
      roomNumber: input.roomNumber,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
    })
  ) {
    throw new Error('guest-mismatch');
  }

  const expiresAtIso = (token?.expiresAt?.toDate?.() ?? new Date(Date.now() + 18 * 60 * 60 * 1000)).toISOString();
  const hotelId = String(token?.hotelId || stay.hotelId || '');
  let accessTokenId = tokenSnap?.id;

  if (!accessTokenId) {
    accessTokenId = await createSparkDemoAccessToken({
      hotelId,
      stayId,
      roomNumber: input.roomNumber.trim(),
      expiresAt: expiresAtIso,
    }).catch(() => undefined);
  }

  const session: GuestSession = {
    accessTokenId,
    hotelId,
    stayId,
    roomNumber: input.roomNumber.trim(),
    lastName: input.lastName.trim().replace(/\s+/g, ' '),
    phoneNumber: normalizeGuestPhone(input.phoneNumber),
    expiresAt: expiresAtIso,
  };

  if (tokenRef) {
    await updateDoc(tokenRef, {
      lastRedeemedAt: serverTimestamp(),
      lastRedeemedRoomNumber: session.roomNumber,
    }).catch(() => undefined);
  }

  await addDoc(collection(db, 'guest_access_logins'), {
    accessTokenId: tokenSnap?.id || null,
    hotelId: session.hotelId,
    stayId: session.stayId,
    roomNumber: session.roomNumber,
    lastName: session.lastName,
    lastNameNormalized: normalizeGuestLastName(session.lastName),
    phoneNumber: session.phoneNumber,
    source: 'spark_demo_guest_app',
    createdAt: serverTimestamp(),
  }).catch(() => undefined);

  persistDemoSession(session);
  return session;
}

async function createSparkDemoGuestOrder(input: CreateGuestOrderInput): Promise<CreateGuestOrderResponse> {
  const session = loadStoredGuestSession();

  if (!session) {
    throw new Error('missing-session');
  }

  if (
    session.roomNumber !== input.roomNumber.trim() ||
    session.lastName !== input.lastName.trim().replace(/\s+/g, ' ') ||
    session.phoneNumber !== normalizeGuestPhone(input.phoneNumber)
  ) {
    throw new Error('session-mismatch');
  }

  const accessTokenId = session.accessTokenId || await createSparkDemoAccessToken({
    hotelId: session.hotelId,
    stayId: session.stayId,
    roomNumber: session.roomNumber,
    expiresAt: session.expiresAt,
  });
  const normalizedSession =
    accessTokenId === session.accessTokenId
      ? session
      : { ...session, accessTokenId };

  if (normalizedSession !== session) {
    persistDemoSession(normalizedSession);
  }

  const rateLimitKey = accessTokenId;
  enforceDemoOrderRateLimit(rateLimitKey);
  const normalizedItems = normalizeDemoOrderItems(input.items);

  if (normalizedItems.length === 0) {
    throw new Error('invalid-items');
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const tax = Math.round(subtotal * 0.21);
  const total = subtotal + tax;

  const orderRef = await addDoc(collection(db, 'orders'), {
    accessTokenId,
    hotelId: normalizedSession.hotelId,
    stayId: normalizedSession.stayId,
    roomNumber: normalizedSession.roomNumber,
    lastName: normalizedSession.lastName,
    lastNameNormalized: normalizeGuestLastName(normalizedSession.lastName),
    phoneNumber: normalizedSession.phoneNumber,
    phoneNumberNormalized: normalizeGuestPhone(normalizedSession.phoneNumber),
    items: normalizedItems,
    subtotal,
    tax,
    total,
    paymentMethod: input.paymentMethod,
    selectedBank: input.selectedBank,
    hasPaymentProof: input.hasPaymentProof,
    status: 'incoming',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isRead: false,
    source: 'spark_demo',
  });

  return {
    orderId: orderRef.id,
    blockedWaUrl: null,
  };
}

export async function redeemGuestAccessSession(input: {
  accessToken: string;
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
}): Promise<GuestSession> {
  if (isSparkDemoMode) {
    return redeemSparkDemoAccessSession(input);
  }

  const result = await redeemGuestAccessCallable({
    accessToken: input.accessToken,
    roomNumber: input.roomNumber.trim(),
    lastName: input.lastName.trim().replace(/\s+/g, ' '),
    phoneNumber: normalizeGuestPhone(input.phoneNumber),
  });

  const data = result.data as RedeemGuestAccessResponse;
  await signInWithCustomToken(auth, data.customToken);
  return data.session;
}

export async function createGuestOrder(input: CreateGuestOrderInput): Promise<CreateGuestOrderResponse> {
  if (isSparkDemoMode) {
    return createSparkDemoGuestOrder(input);
  }

  const result = await createGuestOrderCallable({
    ...input,
    roomNumber: input.roomNumber.trim(),
    lastName: input.lastName.trim().replace(/\s+/g, ' '),
    phoneNumber: normalizeGuestPhone(input.phoneNumber),
  });

  return result.data as CreateGuestOrderResponse;
}

export async function revokeCurrentGuestSession(): Promise<void> {
  if (isSparkDemoMode) {
    clearDemoSession();
    return;
  }

  if (auth.currentUser) {
    await revokeGuestSessionCallable({});
    await signOut(auth);
  }
}
