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
  const isPhonePrefixValid = digits.startsWith('08') || digits.startsWith('628');
  const isPhoneLengthValid = digits.length >= 10 && digits.length <= 14;

  if (hasPhone && !isPhonePrefixValid) {
    return {
      isValid: false,
      error: lang === 'ID'
        ? 'Nomor harus diawali 08 atau +62'
        : 'Number must start with 08 or +62',
    };
  }

  if (hasPhone && !isPhoneLengthValid) {
    const count = digits.length;
    return {
      isValid: false,
      error: lang === 'ID'
        ? `Nomor terlalu ${count < 10 ? 'pendek' : 'panjang'} (${count} digit, butuh 10–14)`
        : `Number too ${count < 10 ? 'short' : 'long'} (${count} digits, need 10–14)`,
    };
  }

  return {
    isValid: isRoomValid && isNameValid && hasPhone && isPhoneLengthValid && isPhonePrefixValid,
    error: '',
  };
}
