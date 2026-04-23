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
  const hasPhone = digits.length > 0;
  const isPhoneLengthValid = digits.length >= 10 && digits.length <= 14;
  const isPhonePrefixValid = digits.startsWith('08') || digits.startsWith('628');
  const isPhoneValid = !hasPhone || (isPhoneLengthValid && isPhonePrefixValid);

  if (hasPhone && !isPhonePrefixValid) {
    return {
      isValid: false,
      error: lang === 'ID' ? 'Nomor harus diawali 08 atau 628' : 'Number must start with 08 or 628',
    };
  }

  if (hasPhone && !isPhoneLengthValid) {
    return {
      isValid: false,
      error: lang === 'ID' ? 'Nomor HP tidak valid (Min. 10 digit)' : 'Invalid phone number (min. 10 digits)',
    };
  }

  return {
    isValid: isRoomValid && isNameValid && isPhoneValid,
    error: '',
  };
}
