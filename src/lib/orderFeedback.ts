import { firebaseConfig } from './firebase';

type FeedbackPayloadValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | Record<string, unknown>;

interface SubmitOrderFeedbackOptions {
  orderId: string;
  payload: Record<string, FeedbackPayloadValue>;
  updateWithSdk: () => Promise<void>;
  fetchImpl?: typeof fetch;
}

function writeFirestoreValue(value: FeedbackPayloadValue) {
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
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

  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, writeFirestoreValue(nestedValue as FeedbackPayloadValue)]),
      ),
    },
  };
}

export function buildOrderFeedbackRestUrl(orderId: string): string {
  const encodedOrderId = encodeURIComponent(orderId);
  return `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders/${encodedOrderId}?key=${firebaseConfig.apiKey}`;
}

export async function submitOrderFeedback({
  orderId,
  payload,
  updateWithSdk,
  fetchImpl = fetch,
}: SubmitOrderFeedbackOptions): Promise<void> {
  try {
    await updateWithSdk();
    return;
  } catch (sdkError) {
    console.warn('Feedback SDK update failed, trying REST fallback.', sdkError);
  }

  const patchUrl = new URL(buildOrderFeedbackRestUrl(orderId));
  Object.keys(payload).forEach((fieldPath) => {
    patchUrl.searchParams.append('updateMask.fieldPaths', fieldPath);
  });

  const response = await fetchImpl(patchUrl.toString(), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, writeFirestoreValue(value)]),
      ),
    }),
  });

  if (!response.ok) {
    throw new Error(`feedback-rest-${response.status}`);
  }
}
