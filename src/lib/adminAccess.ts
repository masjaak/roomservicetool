import { addDoc, collection, doc, getDoc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, isSparkDemoMode } from './firebase';

export interface GuestQrTokenResponse {
  tokenId: string;
  qrUrl: string;
  rawToken: string;
  expiresAt: string;
}

interface CreateGuestQrTokenInput {
  hotelId: string;
  stayId: string;
  roomNumber: string;
  baseUrl: string;
  expiresInMinutes?: number;
}

const createGuestAccessTokenCallable = httpsCallable(functions, 'createGuestAccessToken');
const revokeGuestSessionCallable = httpsCallable(functions, 'revokeGuestSession');

async function createSparkDemoGuestQrToken(input: CreateGuestQrTokenInput): Promise<GuestQrTokenResponse> {
  const staySnap = await getDoc(doc(db, 'guest_stays', input.stayId));

  if (!staySnap.exists()) {
    throw new Error('Guest stay was not found.');
  }

  const stay = staySnap.data();
  const roomNumber = input.roomNumber.trim();

  if (String(stay.roomNumber || '').trim() !== roomNumber) {
    throw new Error('Room number does not match the selected stay.');
  }

  const status = String(stay.status || '').trim().toLowerCase();
  const isActive = stay.checkedIn === true || stay.active === true || ['active', 'checked_in', 'in_house'].includes(status);

  if (!isActive) {
    throw new Error('Guest stay is not active.');
  }

  const expiresAt = Timestamp.fromMillis(Date.now() + (input.expiresInMinutes ?? 720) * 60 * 1000);
  const tokenRef = await addDoc(collection(db, 'guest_access_tokens'), {
    hotelId: input.hotelId.trim(),
    stayId: input.stayId.trim(),
    roomNumber,
    status: 'active',
    mode: 'spark_demo',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt,
  });

  const rawToken = tokenRef.id;
  const qrUrl = `${input.baseUrl.replace(/\/$/, '')}/?access=${rawToken}`;

  return {
    tokenId: tokenRef.id,
    qrUrl,
    rawToken,
    expiresAt: expiresAt.toDate().toISOString(),
  };
}

export async function createGuestQrToken(input: CreateGuestQrTokenInput): Promise<GuestQrTokenResponse> {
  if (isSparkDemoMode) {
    return createSparkDemoGuestQrToken(input);
  }

  const result = await createGuestAccessTokenCallable(input);
  return result.data as GuestQrTokenResponse;
}

export async function revokeGuestSessionAsAdmin(sessionId: string): Promise<void> {
  if (isSparkDemoMode) {
    await updateDoc(doc(db, 'guest_access_tokens', sessionId), {
      status: 'revoked',
      revokedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await revokeGuestSessionCallable({ guestUid: sessionId });
}
