const ACTIVE_STATUSES = new Set(['active', 'checked_in', 'in_house']);

export interface GuestAccessLookupInput {
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
}

interface GuestStayRecord {
  roomNumber?: string;
  lastName?: string;
  lastNameNormalized?: string;
  phoneNumber?: string;
  phoneNumberNormalized?: string;
  checkedIn?: boolean;
  active?: boolean;
  status?: string;
}

export type GuestAccessVerificationResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'unavailable' };

export function normalizeGuestPhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.startsWith('62')) {
    return digits;
  }

  if (digits.startsWith('08')) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export function normalizeGuestLastName(lastName: string): string {
  return lastName.trim().replace(/\s+/g, ' ').toLowerCase();
}

function isGuestStayActive(record: GuestStayRecord): boolean {
  if (record.checkedIn === true || record.active === true) {
    return true;
  }

  if (typeof record.status === 'string') {
    return ACTIVE_STATUSES.has(record.status.trim().toLowerCase());
  }

  return false;
}

export function isGuestStayRecordMatch(
  record: GuestStayRecord,
  input: GuestAccessLookupInput
): boolean {
  if (!isGuestStayActive(record)) {
    return false;
  }

  const roomNumber = input.roomNumber.trim();
  const normalizedLastName = normalizeGuestLastName(input.lastName);
  const normalizedPhoneNumber = normalizeGuestPhone(input.phoneNumber);

  const recordRoomNumber = String(record.roomNumber ?? '').trim();
  const recordLastName = normalizeGuestLastName(record.lastNameNormalized || record.lastName || '');
  const recordPhoneNumber = normalizeGuestPhone(record.phoneNumberNormalized || record.phoneNumber || '');

  return (
    recordRoomNumber === roomNumber &&
    recordLastName === normalizedLastName &&
    recordPhoneNumber === normalizedPhoneNumber
  );
}
