import type { Language } from '../types';

interface GuestAccessInput {
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
  lang: Language;
}

interface GuestAccessValidation {
  isValid: boolean;
  error: string;
}

export function validateGuestAccess({
  roomNumber,
  lastName,
  phoneNumber,
  lang,
}: GuestAccessInput): GuestAccessValidation {
  const isRoomValid = roomNumber.length > 0;
  const isNameValid = lastName.trim().length > 0;

  const digits = phoneNumber.replace(/\D/g, '');
  const hasPhone = digits.length >= 12;

  if (!hasPhone) {
    return {
      isValid: false,
      error: lang === 'ID'
        ? 'Nomor HP harus diisi minimal 12 digit'
        : 'Phone number must be at least 12 digits',
    };
  }

  return {
    isValid: isRoomValid && isNameValid && hasPhone,
    error: '',
  };
}
