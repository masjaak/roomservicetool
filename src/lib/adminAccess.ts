import { addDoc, collection, doc, getDoc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { assertFirebaseConfigured, db, functions, isSparkDemoMode } from './firebase';

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

const createGuestAccessTokenCallable = functions ? httpsCallable(functions, 'createGuestAccessToken') : null;
const revokeGuestSessionCallable = functions ? httpsCallable(functions, 'revokeGuestSession') : null;

async function createSparkDemoGuestQrToken(input: CreateGuestQrTokenInput): Promise<GuestQrTokenResponse> {
  const firestore = assertFirebaseConfigured(db, 'Firestore');
  const staySnap = await getDoc(doc(firestore, 'guest_stays', input.stayId));

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
  const tokenRef = await addDoc(collection(firestore, 'guest_access_tokens'), {
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

  const callable = assertFirebaseConfigured(createGuestAccessTokenCallable, 'Firebase Functions');
  const result = await callable(input);
  return result.data as GuestQrTokenResponse;
}

export async function revokeGuestSessionAsAdmin(sessionId: string): Promise<void> {
  if (isSparkDemoMode) {
    const firestore = assertFirebaseConfigured(db, 'Firestore');
    await updateDoc(doc(firestore, 'guest_access_tokens', sessionId), {
      status: 'revoked',
      revokedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const callable = assertFirebaseConfigured(revokeGuestSessionCallable, 'Firebase Functions');
  await callable({ guestUid: sessionId });
}
