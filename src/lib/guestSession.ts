import { signInWithCustomToken, signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { assertFirebaseConfigured, auth, firebaseConfig, functions, isSparkDemoMode } from './firebase';
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

interface DemoAccessTokenRecord {
  hotelId?: string;
  stayId?: string;
  status?: string;
  expiresAt?: Date | null;
}

interface FirestoreRestDocument {
  name: string;
  fields?: Record<string, FirestoreRestValue>;
}

type FirestoreRestValue =
  | { stringValue?: string }
  | { integerValue?: string }
  | { doubleValue?: number }
  | { booleanValue?: boolean }
  | { timestampValue?: string }
  | { nullValue?: null }
  | { arrayValue?: { values?: FirestoreRestValue[] } }
  | { mapValue?: { fields?: Record<string, FirestoreRestValue> } };

const DEMO_SESSION_STORAGE_KEY = 'hcs_guest_demo_session';
const DEMO_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const DEMO_RATE_LIMIT_MAX = 3;
const DEMO_LOGIN_TIMEOUT_MS = 8000;

const redeemGuestAccessCallable = functions ? httpsCallable(functions, 'redeemGuestAccess') : null;
const createGuestOrderCallable = functions ? httpsCallable(functions, 'createGuestOrder') : null;
const revokeGuestSessionCallable = functions ? httpsCallable(functions, 'revokeGuestSession') : null;

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

function getFirestoreRestBaseUrl(): string {
  return `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
}

function getFirestoreDocumentId(documentName: string): string {
  return documentName.split('/').pop() || '';
}

function readFirestoreRestValue(value: FirestoreRestValue | undefined): unknown {
  if (!value) {
    return undefined;
  }

  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue ? new Date(value.timestampValue) : null;
  if ('nullValue' in value) return null;
  return undefined;
}

function mapFirestoreRestFields<T extends Record<string, unknown>>(document: FirestoreRestDocument): T {
  const fields = document.fields || {};

  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, readFirestoreRestValue(value)]),
  ) as T;
}

function writeFirestoreRestValue(value: unknown): FirestoreRestValue {
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return { arrayValue: value.length ? { values: value.map(writeFirestoreRestValue) } : {} };
  }

  if (value === null || typeof value === 'undefined') {
    return { nullValue: null };
  }

  if (typeof value === 'string') {
    return { stringValue: value };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }

  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
            key,
            writeFirestoreRestValue(nestedValue),
          ]),
        ),
      },
    };
  }

  return { stringValue: String(value) };
}

async function fetchJsonWithTimeout<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), DEMO_LOGIN_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`rest-${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('timeout');
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function createFirestoreRestDocument(collectionName: string, payload: Record<string, unknown>): Promise<string> {
  const document = await fetchJsonWithTimeout<FirestoreRestDocument>(
    `${getFirestoreRestBaseUrl()}/${collectionName}?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: Object.fromEntries(
          Object.entries(payload).map(([key, value]) => [key, writeFirestoreRestValue(value)]),
        ),
      }),
    },
  );

  return getFirestoreDocumentId(document.name);
}

async function getDemoAccessTokenViaRest(accessToken: string): Promise<{ id: string; token: DemoAccessTokenRecord }> {
  const document = await fetchJsonWithTimeout<FirestoreRestDocument>(
    `${getFirestoreRestBaseUrl()}/guest_access_tokens/${encodeURIComponent(accessToken)}?key=${firebaseConfig.apiKey}`,
  ).catch((error) => {
    if (error instanceof Error && error.message === 'rest-404') {
      throw new Error('invalid-token');
    }

    throw error;
  });

  const token = mapFirestoreRestFields<Record<string, unknown>>(document);

  return {
    id: getFirestoreDocumentId(document.name),
    token: {
      hotelId: typeof token.hotelId === 'string' ? token.hotelId : '',
      stayId: typeof token.stayId === 'string' ? token.stayId : '',
      status: typeof token.status === 'string' ? token.status : '',
      expiresAt: token.expiresAt instanceof Date ? token.expiresAt : null,
    },
  };
}

async function getDemoStayViaRest(stayId: string): Promise<{ id: string; stay: DemoGuestStayRecord } | null> {
  const document = await fetchJsonWithTimeout<FirestoreRestDocument>(
    `${getFirestoreRestBaseUrl()}/guest_stays/${encodeURIComponent(stayId)}?key=${firebaseConfig.apiKey}`,
  ).catch((error) => {
    if (error instanceof Error && error.message === 'rest-404') {
      return null;
    }

    throw error;
  });

  if (!document) {
    return null;
  }

  return {
    id: getFirestoreDocumentId(document.name),
    stay: mapFirestoreRestFields<DemoGuestStayRecord & Record<string, unknown>>(document),
  };
}

async function findMatchingDemoStayViaRest(input: {
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
}): Promise<{ id: string; stay: DemoGuestStayRecord } | null> {
  const result = await fetchJsonWithTimeout<Array<{ document?: FirestoreRestDocument }>>(
    `${getFirestoreRestBaseUrl()}:runQuery?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'guest_stays' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'roomNumber' },
              op: 'EQUAL',
              value: { stringValue: input.roomNumber.trim() },
            },
          },
          limit: 10,
        },
      }),
    },
  );

  for (const row of result) {
    if (!row.document) {
      continue;
    }

    const stay = mapFirestoreRestFields<DemoGuestStayRecord & Record<string, unknown>>(row.document);

    if (isGuestStayRecordMatch(stay, input)) {
      return {
        id: getFirestoreDocumentId(row.document.name),
        stay,
      };
    }
  }

  return null;
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
  let accessTokenId: string | undefined;
  let expiresAt: Date | null = null;
  let hotelId = '';

  if (input.accessToken.trim()) {
    const tokenMatch = await getDemoAccessTokenViaRest(input.accessToken.trim());
    const token = tokenMatch.token;
    accessTokenId = tokenMatch.id;
    expiresAt = token.expiresAt ?? null;

    if (token.status !== 'active' || !expiresAt || expiresAt.getTime() <= Date.now()) {
      throw new Error('inactive-token');
    }

    const stayId = String(token.stayId || '');
    if (!stayId) {
      throw new Error('invalid-stay');
    }

    const stayMatch = await getDemoStayViaRest(stayId);
    if (!stayMatch) {
      throw new Error('missing-stay');
    }

    if (!isGuestStayRecordMatch(stayMatch.stay, input)) {
      throw new Error('guest-mismatch');
    }

    hotelId = String(token.hotelId || stayMatch.stay.hotelId || '');
  }

  const expiresAtIso = (expiresAt ?? new Date(Date.now() + 18 * 60 * 60 * 1000)).toISOString();

  const session: GuestSession = {
    accessTokenId,
    hotelId,
    stayId: '',
    roomNumber: input.roomNumber.trim(),
    lastName: input.lastName.trim().replace(/\s+/g, ' '),
    phoneNumber: normalizeGuestPhone(input.phoneNumber),
    expiresAt: expiresAtIso,
  };

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

  const accessTokenId = session.accessTokenId || '';
  const rateLimitKey = accessTokenId || `stay-${session.stayId}`;
  enforceDemoOrderRateLimit(rateLimitKey);
  const normalizedItems = normalizeDemoOrderItems(input.items);

  if (normalizedItems.length === 0) {
    throw new Error('invalid-items');
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const tax = Math.round(subtotal * 0.21);
  const total = subtotal + tax;

  const createdAt = new Date();
  const orderId = await createFirestoreRestDocument('orders', {
    accessTokenId: accessTokenId || '',
    hotelId: session.hotelId,
    stayId: session.stayId,
    roomNumber: session.roomNumber,
    lastName: session.lastName,
    lastNameNormalized: normalizeGuestLastName(session.lastName),
    phoneNumber: session.phoneNumber,
    phoneNumberNormalized: normalizeGuestPhone(session.phoneNumber),
    items: normalizedItems,
    subtotal,
    tax,
    total,
    paymentMethod: input.paymentMethod,
    selectedBank: input.selectedBank,
    hasPaymentProof: input.hasPaymentProof,
    status: 'incoming',
    createdAt,
    updatedAt: createdAt,
    isRead: false,
    source: 'spark_demo',
  });

  return {
    orderId,
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
    const session: GuestSession = {
      accessTokenId: undefined,
      hotelId: '',
      stayId: 'demo',
      roomNumber: input.roomNumber.trim(),
      lastName: input.lastName.trim().replace(/\s+/g, ' '),
      phoneNumber: normalizeGuestPhone(input.phoneNumber),
      expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    };
    persistDemoSession(session);
    return session;
  }

  const callable = assertFirebaseConfigured(redeemGuestAccessCallable, 'Firebase Functions');
  const authInstance = assertFirebaseConfigured(auth, 'Firebase Auth');
  const result = await callable({
    accessToken: input.accessToken,
    roomNumber: input.roomNumber.trim(),
    lastName: input.lastName.trim().replace(/\s+/g, ' '),
    phoneNumber: normalizeGuestPhone(input.phoneNumber),
  });

  const data = result.data as RedeemGuestAccessResponse;
  await signInWithCustomToken(authInstance, data.customToken);
  return data.session;
}

export async function createGuestOrder(input: CreateGuestOrderInput): Promise<CreateGuestOrderResponse> {
  if (isSparkDemoMode) {
    return createSparkDemoGuestOrder(input);
  }

  const callable = assertFirebaseConfigured(createGuestOrderCallable, 'Firebase Functions');
  const result = await callable({
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

  const authInstance = assertFirebaseConfigured(auth, 'Firebase Auth');
  const callable = assertFirebaseConfigured(revokeGuestSessionCallable, 'Firebase Functions');

  if (authInstance.currentUser) {
    await callable({});
    await signOut(authInstance);
  }
}
