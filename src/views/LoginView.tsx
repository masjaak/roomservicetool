import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { guestTheme } from '../styles/guestTheme';
import { validateGuestAccess } from './loginValidation';

interface LoginViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogin: (room: string, phone: string, lastName: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ lang, setLang, onLogin }) => {
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const lastNameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const validation = validateGuestAccess({
      roomNumber,
      lastName,
      phoneNumber,
      lang,
    });

    setIsValid(validation.isValid);
    setError(validation.error);
  }, [roomNumber, phoneNumber, lastName, lang]);

  const handleSubmit = () => {
    if (isValid) {
      onLogin(roomNumber, phoneNumber, lastName);
    }
  };

  const moveFocusToNextField = (event: React.KeyboardEvent<HTMLInputElement>, nextField?: HTMLInputElement | null) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    if (nextField) {
      nextField.focus();
      return;
    }

    handleSubmit();
  };

  return (
    <div className={`min-h-screen ${guestTheme.bg.canvas}`}>
      <div className={`hcs-grain relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden ${guestTheme.bg.surface} shadow-xl`}>
        <div className="absolute inset-0 z-0">
          <img src="/assets/hero.jpg" className="h-full w-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:rgba(26,28,27,0.6)] via-[color:rgba(26,28,27,0.2)] to-[color:rgba(26,28,27,0.9)]" />
        </div>

        <div className="absolute right-6 top-6 z-20">
          <div className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md">
            <button onClick={() => setLang('ID')} className={lang === 'ID' ? 'opacity-100' : 'opacity-50'}>
              ID
            </button>
            <span className="mx-2 opacity-40">/</span>
            <button onClick={() => setLang('EN')} className={lang === 'EN' ? 'opacity-100' : 'opacity-50'}>
              EN
            </button>
          </div>
        </div>

        <header className="relative z-10 px-8 pt-16 text-center">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/80">
            {lang === 'ID' ? 'Selamat datang di' : 'Welcome to'}
          </p>
          <h1 className="font-headline text-3xl italic tracking-widest text-white">Atelier Meridian</h1>
        </header>

        <div className="flex-1" />

        <motion.section
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55 }}
          className={`relative z-10 rounded-t-[2rem] ${guestTheme.bg.surface} px-8 pb-12 pt-10 shadow-[0_-20px_40px_rgba(26,28,27,0.12)]`}
        >
          <div className="mb-8">
            <h2 className={`font-headline text-2xl ${guestTheme.text.base}`}>{t.loginTitle}</h2>
            <p className={`mt-2 text-sm leading-relaxed ${guestTheme.text.muted}`}>{t.loginBody}</p>
          </div>

          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <div className={`relative border-b ${guestTheme.border.base}/50 transition-colors focus-within:border-[var(--hcs-primary)]`}>
              <input
                id="room_number"
                ref={roomInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="next"
                value={roomNumber}
                placeholder=" "
                onKeyDown={(event) => moveFocusToNextField(event, lastNameInputRef.current)}
                onChange={(e) => {
                  if (/^\d{0,4}$/.test(e.target.value)) setRoomNumber(e.target.value);
                }}
                className={`peer block h-[44px] w-full border-none bg-transparent px-0 py-3 text-base font-medium ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="room_number"
                className={`pointer-events-none absolute left-0 font-label text-sm uppercase tracking-wider transition-all duration-200 ${
                  roomNumber ? `-top-4 scale-[0.85] ${guestTheme.text.primary}` : `top-3 ${guestTheme.text.muted}`
                } peer-focus:-top-4 peer-focus:scale-[0.85] ${guestTheme.text.primary}`}
              >
                {t.room}
              </label>
            </div>

            <div className={`relative border-b ${guestTheme.border.base}/50 transition-colors focus-within:border-[var(--hcs-primary)]`}>
              <input
                id="last_name"
                ref={lastNameInputRef}
                type="text"
                autoComplete="family-name"
                enterKeyHint="next"
                value={lastName}
                placeholder=" "
                onKeyDown={(event) => moveFocusToNextField(event, phoneInputRef.current)}
                onChange={(e) => setLastName(e.target.value)}
                className={`peer block h-[44px] w-full border-none bg-transparent px-0 py-3 text-base font-medium ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="last_name"
                className={`pointer-events-none absolute left-0 font-label text-sm uppercase tracking-wider transition-all duration-200 ${
                  lastName ? `-top-4 scale-[0.85] ${guestTheme.text.primary}` : `top-3 ${guestTheme.text.muted}`
                } peer-focus:-top-4 peer-focus:scale-[0.85] ${guestTheme.text.primary}`}
              >
                {t.lastName}
              </label>
            </div>

            <div className={`relative border-b transition-colors focus-within:border-[var(--hcs-primary)] ${error ? `${guestTheme.border.error}/50` : `${guestTheme.border.base}/50`}`}>
              <input
                id="phone_number"
                ref={phoneInputRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                enterKeyHint="done"
                value={phoneNumber}
                placeholder=" "
                onKeyDown={(event) => moveFocusToNextField(event)}
                onChange={(e) => {
                  if (/^\d{0,14}$/.test(e.target.value)) setPhoneNumber(e.target.value);
                }}
                className={`peer block h-[44px] w-full border-none bg-transparent px-0 py-3 text-base font-medium ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="phone_number"
                className={`pointer-events-none absolute left-0 font-label text-sm uppercase tracking-wider transition-all duration-200 ${
                  phoneNumber ? `-top-4 scale-[0.85] ${guestTheme.text.primary}` : `top-3 ${guestTheme.text.muted}`
                } peer-focus:-top-4 peer-focus:scale-[0.85] ${guestTheme.text.primary}`}
              >
                {t.phone}
              </label>
            </div>

            {error && <p className={`rounded-lg ${guestTheme.bg.errorSoft} px-4 py-3 text-sm ${guestTheme.text.error}`}>{error}</p>}

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isValid}
                className={`flex h-14 w-full items-center justify-center rounded-lg ${guestTheme.bg.primary} px-6 text-xs font-bold uppercase tracking-[0.2em] ${guestTheme.text.onPrimary} shadow-lg transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {t.accessDining}
              </button>
            </div>
          </form>

          <div className={`mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] ${guestTheme.text.muted}/70`}>
            <span>{t.assistance}</span>
            <span>{t.frontDesk}</span>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
