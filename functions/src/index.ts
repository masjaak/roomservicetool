import { randomBytes, createHash } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import {
  FieldValue,
  Filter,
  Timestamp,
  getFirestore,
} from 'firebase-admin/firestore';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore();
const auth = getAuth();

const REGION = 'asia-southeast2';
const ENFORCE_APP_CHECK = process.env.FUNCTIONS_EMULATOR !== 'true';
const GUEST_SESSION_HOURS = 18;
const ORDER_RATE_LIMIT_MAX = 3;
const ORDER_RATE_LIMIT_WINDOW_SECONDS = 300;
const TOKEN_DEFAULT_TTL_MINUTES = 720;
const ACTIVE_STATUSES = new Set(['active', 'checked_in', 'in_house']);

interface GuestStayRecord {
  hotelId: string;
  roomNumber: string;
  lastName?: string;
  lastNameNormalized?: string;
  phoneNumber?: string;
  phoneNumberNormalized?: string;
  checkedIn?: boolean;
  active?: boolean;
  status?: string;
}

interface RedeemGuestAccessData {
  accessToken: string;
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
}

interface CreateGuestOrderData {
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
  items: unknown[];
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentMethod: 'room' | 'qris' | 'bank';
  selectedBank: string | null;
  hasPaymentProof: boolean;
}

interface CreateGuestAccessTokenData {
  hotelId: string;
  stayId: string;
  roomNumber: string;
  expiresInMinutes?: number;
  baseUrl: string;
}

interface NormalizedOrderItem {
  id: unknown;
  name: string;
  price: number;
  qty: number;
  note: string;
  image: string;
  description: string;
  category: string;
  tag: string;
  allergens: string;
}

function asTrimmedString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${field} must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new HttpsError('invalid-argument', `${field} is required.`);
  }

  return trimmed;
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new HttpsError('invalid-argument', `${field} must be a valid number.`);
  }

  return value;
}

function asOptionalNumber(value: unknown, field: string): number | null {
  if (value == null) {
    return null;
  }

  return asNumber(value, field);
}

function normalizeGuestPhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.startsWith('62')) {
    return digits;
  }

  if (digits.startsWith('08')) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

function normalizeGuestLastName(lastName: string): string {
  return lastName.trim().replace(/\s+/g, ' ').toLowerCase();
}

function hashAccessToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

function isStayActive(stay: GuestStayRecord): boolean {
  if (stay.checkedIn === true || stay.active === true) {
    return true;
  }

  if (typeof stay.status === 'string') {
    return ACTIVE_STATUSES.has(stay.status.trim().toLowerCase());
  }

  return false;
}

function matchesStayRecord(
  stay: GuestStayRecord,
  roomNumber: string,
  lastName: string,
  phoneNumber: string,
): boolean {
  if (!isStayActive(stay)) {
    return false;
  }

  const stayLastName = normalizeGuestLastName(stay.lastNameNormalized || stay.lastName || '');
  const stayPhone = normalizeGuestPhone(stay.phoneNumberNormalized || stay.phoneNumber || '');

  return (
    stay.roomNumber.trim() === roomNumber &&
    stayLastName === normalizeGuestLastName(lastName) &&
    stayPhone === normalizeGuestPhone(phoneNumber)
  );
}

function getGuestUid(stayId: string): string {
  return `guest_${stayId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

async function isAdminCaller(request: CallableRequest<unknown>): Promise<boolean> {
  const uid = request.auth?.uid;

  if (!uid) {
    return false;
  }

  if (request.auth?.token?.admin === true || request.auth?.token?.role === 'admin') {
    return true;
  }

  const adminDoc = await db.collection('admin_users').doc(uid).get();
  return adminDoc.exists && adminDoc.data()?.active === true;
}

async function getGuestSessionOrThrow(uid: string) {
  const sessionSnap = await db.collection('guest_access_sessions').doc(uid).get();

  if (!sessionSnap.exists) {
    throw new HttpsError('failed-precondition', 'Guest session was not found.');
  }

  const session = sessionSnap.data();
  if (!session || session.status !== 'active') {
    throw new HttpsError('permission-denied', 'Guest session is not active.');
  }

  const expiresAt = session.expiresAt;
  if (!(expiresAt instanceof Timestamp) || expiresAt.toMillis() <= Date.now()) {
    throw new HttpsError('permission-denied', 'Guest session has expired.');
  }

  return session;
}

async function enforceOrderRateLimit(uid: string): Promise<void> {
  const now = Timestamp.now();
  const bucket = Math.floor(now.seconds / ORDER_RATE_LIMIT_WINDOW_SECONDS);
  const rateLimitRef = db.collection('rate_limits').doc(`order_${uid}_${bucket}`);

  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(rateLimitRef);
    const count = snap.exists ? Number(snap.data()?.count || 0) : 0;

    if (count >= ORDER_RATE_LIMIT_MAX) {
      throw new HttpsError(
        'resource-exhausted',
        'Order limit reached. Please wait a moment before placing another order.',
      );
    }

    transaction.set(
      rateLimitRef,
      {
        type: 'guest_order',
        uid,
        bucket,
        count: count + 1,
        windowSeconds: ORDER_RATE_LIMIT_WINDOW_SECONDS,
        createdAt: snap.exists ? snap.data()?.createdAt || now : now,
        updatedAt: now,
        expiresAt: Timestamp.fromMillis((bucket + 1) * ORDER_RATE_LIMIT_WINDOW_SECONDS * 1000),
      },
      { merge: true },
    );
  });
}

export const redeemGuestAccess = onCall(
  { region: REGION, enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const accessToken = asTrimmedString(request.data?.accessToken, 'accessToken');
    const roomNumber = asTrimmedString(request.data?.roomNumber, 'roomNumber');
    const lastName = asTrimmedString(request.data?.lastName, 'lastName');
    const phoneNumber = normalizeGuestPhone(asTrimmedString(request.data?.phoneNumber, 'phoneNumber'));

    const tokenHash = hashAccessToken(accessToken);
    const tokenQuery = await db
      .collection('guest_access_tokens')
      .where('tokenHash', '==', tokenHash)
      .limit(1)
      .get();

    if (tokenQuery.empty) {
      throw new HttpsError('permission-denied', 'Access token is invalid.');
    }

    const tokenSnap = tokenQuery.docs[0];
    const token = tokenSnap.data();
    const expiresAt = token.expiresAt;

    if (token.status !== 'active') {
      throw new HttpsError('permission-denied', 'Access token is no longer active.');
    }

    if (!(expiresAt instanceof Timestamp) || expiresAt.toMillis() <= Date.now()) {
      throw new HttpsError('permission-denied', 'Access token has expired.');
    }

    const stayRef = db.collection('guest_stays').doc(String(token.stayId));
    const staySnap = await stayRef.get();

    if (!staySnap.exists) {
      throw new HttpsError('failed-precondition', 'Guest stay record was not found.');
    }

    const stay = staySnap.data() as GuestStayRecord;

    if (!matchesStayRecord(stay, roomNumber, lastName, phoneNumber)) {
      throw new HttpsError('permission-denied', 'Guest details do not match an active stay.');
    }

    const uid = getGuestUid(String(token.stayId));
    const sessionExpiresAt = Timestamp.fromMillis(
      Math.min(
        expiresAt.toMillis(),
        Date.now() + GUEST_SESSION_HOURS * 60 * 60 * 1000,
      ),
    );

    await auth.createUser({ uid }).catch(async (error: { code?: string }) => {
      if (error.code !== 'auth/uid-already-exists') {
        throw error;
      }
    });

    await auth.setCustomUserClaims(uid, {
      role: 'guest',
      hotelId: token.hotelId,
      stayId: token.stayId,
    });

    const guestSession = {
      hotelId: token.hotelId,
      stayId: token.stayId,
      roomNumber,
      lastName: lastName.trim().replace(/\s+/g, ' '),
      phoneNumber,
      role: 'guest',
      status: 'active',
      source: 'qr',
      expiresAt: sessionExpiresAt,
      createdAt: FieldValue.serverTimestamp(),
      lastSeenAt: FieldValue.serverTimestamp(),
    };

    const batch = db.batch();
    batch.set(db.collection('guest_access_sessions').doc(uid), guestSession, { merge: true });
    batch.update(tokenSnap.ref, {
      status: 'redeemed',
      redeemedAt: FieldValue.serverTimestamp(),
      redeemedByUid: uid,
    });
    batch.create(db.collection('guest_access_logins').doc(), {
      hotelId: token.hotelId,
      stayId: token.stayId,
      guestUid: uid,
      roomNumber,
      lastName: lastName.trim().replace(/\s+/g, ' '),
      lastNameNormalized: normalizeGuestLastName(lastName),
      phoneNumber,
      createdAt: FieldValue.serverTimestamp(),
      source: 'guest_app',
    });
    await batch.commit();

    const customToken = await auth.createCustomToken(uid, {
      role: 'guest',
      hotelId: token.hotelId,
      stayId: token.stayId,
    });

    return {
      customToken,
      session: {
        hotelId: token.hotelId,
        stayId: token.stayId,
        roomNumber,
        lastName: lastName.trim().replace(/\s+/g, ' '),
        phoneNumber,
        expiresAt: sessionExpiresAt.toDate().toISOString(),
      },
    };
  },
);

export const createGuestAccessToken = onCall(
  { region: REGION, enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    if (!(await isAdminCaller(request))) {
      throw new HttpsError('permission-denied', 'Only admins can create guest access tokens.');
    }

    const hotelId = asTrimmedString(request.data?.hotelId, 'hotelId');
    const stayId = asTrimmedString(request.data?.stayId, 'stayId');
    const roomNumber = asTrimmedString(request.data?.roomNumber, 'roomNumber');
    const baseUrl = asTrimmedString(request.data?.baseUrl, 'baseUrl');
    const expiresInMinutes = request.data?.expiresInMinutes == null
      ? TOKEN_DEFAULT_TTL_MINUTES
      : asNumber(request.data?.expiresInMinutes, 'expiresInMinutes');

    const rawToken = randomBytes(24).toString('hex');
    const tokenHash = hashAccessToken(rawToken);
    const expiresAt = Timestamp.fromMillis(Date.now() + expiresInMinutes * 60 * 1000);
    const tokenRef = db.collection('guest_access_tokens').doc();

    await tokenRef.set({
      hotelId,
      stayId,
      roomNumber,
      tokenHash,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      createdBy: request.auth?.uid || null,
      expiresAt,
    });

    const qrUrl = `${baseUrl.replace(/\/$/, '')}/?access=${rawToken}`;

    return {
      tokenId: tokenRef.id,
      qrUrl,
      rawToken,
      expiresAt: expiresAt.toDate().toISOString(),
    };
  },
);

export const createGuestOrder = onCall(
  { region: REGION, enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    if (!request.auth?.uid || request.auth.token?.role !== 'guest') {
      throw new HttpsError('permission-denied', 'Only verified guest sessions can place orders.');
    }

    const uid = request.auth.uid;
    const session = await getGuestSessionOrThrow(uid);
    await enforceOrderRateLimit(uid);

    const roomNumber = asTrimmedString(request.data?.roomNumber, 'roomNumber');
    const lastName = asTrimmedString(request.data?.lastName, 'lastName');
    const phoneNumber = normalizeGuestPhone(asTrimmedString(request.data?.phoneNumber, 'phoneNumber'));
    const paymentMethod = asTrimmedString(request.data?.paymentMethod, 'paymentMethod') as CreateGuestOrderData['paymentMethod'];
    const clientSubtotal = asOptionalNumber(request.data?.subtotal, 'subtotal');
    const clientTax = asOptionalNumber(request.data?.tax, 'tax');
    const clientTotal = asOptionalNumber(request.data?.total, 'total');
    const selectedBank = request.data?.selectedBank == null ? null : asTrimmedString(request.data?.selectedBank, 'selectedBank');
    const hasPaymentProof = Boolean(request.data?.hasPaymentProof);
    const items = Array.isArray(request.data?.items) ? request.data.items : null;

    if (!items || items.length === 0) {
      throw new HttpsError('invalid-argument', 'At least one item is required.');
    }

    const normalizedItems: NormalizedOrderItem[] = items.map((item: unknown, index: number) => {
      if (!item || typeof item !== 'object') {
        throw new HttpsError('invalid-argument', `Item ${index + 1} is invalid.`);
      }

      const row = item as Record<string, unknown>;
      const qty = asNumber(row.qty, `items[${index}].qty`);
      const price = asNumber(row.price, `items[${index}].price`);

      if (!Number.isInteger(qty) || qty <= 0) {
        throw new HttpsError('invalid-argument', `Item ${index + 1} quantity must be a positive integer.`);
      }

      if (price < 0) {
        throw new HttpsError('invalid-argument', `Item ${index + 1} price must be zero or greater.`);
      }

      return {
        id: row.id ?? null,
        name: asTrimmedString(row.name, `items[${index}].name`),
        price,
        qty,
        note: typeof row.note === 'string' ? row.note : '',
        image: typeof row.image === 'string' ? row.image : '',
        description: typeof row.description === 'string' ? row.description : '',
        category: typeof row.category === 'string' ? row.category : '',
        tag: typeof row.tag === 'string' ? row.tag : '',
        allergens: typeof row.allergens === 'string' ? row.allergens : '',
      };
    });

    const subtotal = normalizedItems.reduce((sum: number, item: NormalizedOrderItem) => sum + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.21);
    const total = subtotal + tax;

    if (clientSubtotal !== null && clientSubtotal !== subtotal) {
      throw new HttpsError('invalid-argument', 'Client subtotal does not match server calculation.');
    }

    if (clientTax !== null && clientTax !== tax) {
      throw new HttpsError('invalid-argument', 'Client tax does not match server calculation.');
    }

    if (clientTotal !== null && clientTotal !== total) {
      throw new HttpsError('invalid-argument', 'Client total does not match server calculation.');
    }

    if (session.roomNumber !== roomNumber || session.lastName !== lastName.trim().replace(/\s+/g, ' ') || session.phoneNumber !== phoneNumber) {
      throw new HttpsError('permission-denied', 'Guest order details do not match the active session.');
    }

    if (paymentMethod === 'bank' && (!selectedBank || !hasPaymentProof)) {
      throw new HttpsError('invalid-argument', 'Bank transfer requires bank selection and proof.');
    }

    if (paymentMethod === 'qris' && !hasPaymentProof) {
      throw new HttpsError('invalid-argument', 'QRIS requires payment proof.');
    }

    const orderRef = db.collection('orders').doc();
    await orderRef.set({
      hotelId: session.hotelId,
      stayId: session.stayId,
      guestUid: uid,
      roomNumber,
      lastName: lastName.trim().replace(/\s+/g, ' '),
      phoneNumber,
      items: normalizedItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      selectedBank,
      hasPaymentProof,
      status: 'incoming',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isRead: false,
    });

    return {
      orderId: orderRef.id,
      blockedWaUrl: null,
    };
  },
);

export const revokeGuestSession = onCall(
  { region: REGION, enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const callerUid = request.auth?.uid;

    if (!callerUid) {
      throw new HttpsError('unauthenticated', 'Authentication is required.');
    }

    const requestedGuestUid = typeof request.data?.guestUid === 'string' ? request.data.guestUid.trim() : '';
    const isAdmin = await isAdminCaller(request);
    const guestUid = isAdmin && requestedGuestUid ? requestedGuestUid : callerUid;

    await db.collection('guest_access_sessions').doc(guestUid).set({
      status: 'revoked',
      revokedAt: FieldValue.serverTimestamp(),
      revokedBy: callerUid,
      expiresAt: Timestamp.now(),
    }, { merge: true });

    await auth.revokeRefreshTokens(guestUid).catch(() => undefined);

    return { ok: true };
  },
);
