import { firebaseConfig } from './firebase';

interface FirestoreRestDocument {
  fields?: {
    status?: {
      stringValue?: string;
    };
  };
}

export function buildOrderStatusRestUrl(orderId: string): string {
  const encodedOrderId = encodeURIComponent(orderId);
  return `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders/${encodedOrderId}?key=${firebaseConfig.apiKey}`;
}

export function readOrderStatusFromRestDocument(document: unknown): string | null {
  const status = (document as FirestoreRestDocument | null)?.fields?.status?.stringValue;
  return typeof status === 'string' && status.trim() ? status : null;
}

export async function fetchOrderStatus(
  orderId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  if (!orderId) return null;

  const response = await fetchImpl(buildOrderStatusRestUrl(orderId));
  if (!response.ok) {
    throw new Error(`order-status-rest-${response.status}`);
  }

  return readOrderStatusFromRestDocument(await response.json());
}
