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
      <div className="relative min-h-screen lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(26rem,34rem)] lg:bg-[var(--hcs-background)]">
        <div className="absolute inset-0 lg:relative lg:min-h-screen">
          <img src="/assets/hero.jpg" className="h-full w-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:rgba(35,30,24,0.56)] via-[color:rgba(35,30,24,0.18)] to-[color:rgba(26,28,27,0.76)] lg:bg-gradient-to-r lg:from-[color:rgba(26,28,27,0.34)] lg:via-[color:rgba(26,28,27,0.08)] lg:to-[color:rgba(26,28,27,0.48)]" />
        </div>

        <div className="absolute right-6 top-6 z-20 lg:right-auto lg:left-10 lg:top-10">
          <div className="rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-md lg:border-black/10 lg:bg-white/55 lg:text-[var(--hcs-text)]">
            <button onClick={() => setLang('ID')} className={lang === 'ID' ? 'opacity-100' : 'opacity-50'}>
              ID
            </button>
            <span className="mx-2 opacity-40">/</span>
            <button onClick={() => setLang('EN')} className={lang === 'EN' ? 'opacity-100' : 'opacity-50'}>
              EN
            </button>
          </div>
        </div>

        <header className="relative z-10 px-8 pt-28 text-center lg:flex lg:min-h-screen lg:flex-col lg:items-center lg:justify-center lg:px-12 lg:pt-0">
          <div className="mx-auto inline-flex max-w-full flex-col items-center justify-center rounded-[1.75rem] bg-white/8 px-7 py-6 text-center backdrop-blur-[22px] shadow-[0_16px_48px_rgba(0,0,0,0.12)] ring-1 ring-white/12 lg:max-w-[34rem] lg:px-10 lg:py-9">
            <p className="mb-5 text-center text-[11px] uppercase tracking-[0.38em] text-white/80 lg:mb-6 lg:text-white/75">
              {lang === 'ID' ? 'Selamat datang di' : 'Welcome to'}
            </p>
            <h1 className="font-headline text-center text-[4rem] italic tracking-[0.06em] text-white [text-shadow:0_8px_24px_rgba(0,0,0,0.16)] lg:text-[5.8rem] lg:leading-[0.96]">
              Atelier Meridian
            </h1>
          </div>
        </header>

        <div className="flex min-h-screen flex-col lg:min-h-0 lg:bg-[var(--hcs-surface-soft)] lg:px-8 lg:py-8">
          <div className="flex-1 lg:hidden" />

          <motion.section
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55 }}
            className={`relative z-10 rounded-t-[3.25rem] ${guestTheme.bg.surface} px-8 pb-12 pt-12 shadow-[0_-20px_40px_rgba(26,28,27,0.1)] lg:my-auto lg:rounded-[2rem] lg:px-10 lg:pb-10 lg:pt-10 lg:shadow-[0_18px_60px_rgba(26,28,27,0.08)]`}
          >
          <div className="mb-10 text-center lg:mb-9">
            <h2 className={`font-headline text-[3.05rem] leading-[1.02] ${guestTheme.text.base} lg:text-[2.75rem]`}>{t.loginTitle}</h2>
            <p className={`mx-auto mt-4 max-w-[19rem] text-[1.08rem] leading-[1.6] ${guestTheme.text.muted} lg:max-w-[24rem] lg:text-[1rem]`}>
              {t.loginBody}
            </p>
          </div>

          <form
            className="space-y-10"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <div className={`relative border-b ${guestTheme.border.base}/40 pb-1 transition-colors focus-within:border-[var(--hcs-primary)]`}>
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
                className={`peer block h-[4.1rem] w-full border-none bg-transparent px-0 pb-2 pt-6 text-[1.2rem] font-medium ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="room_number"
                className={`pointer-events-none absolute left-0 font-label text-[1rem] uppercase tracking-[0.08em] transition-all duration-200 ${
                  roomNumber ? `top-0 scale-[0.8] ${guestTheme.text.primary}` : `top-5 ${guestTheme.text.base}/85`
                } peer-focus:top-0 peer-focus:scale-[0.8] ${guestTheme.text.primary}`}
              >
                {t.room}
              </label>
            </div>

            <div className={`relative border-b ${guestTheme.border.base}/40 pb-1 transition-colors focus-within:border-[var(--hcs-primary)]`}>
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
                className={`peer block h-[4.1rem] w-full border-none bg-transparent px-0 pb-2 pt-6 text-[1.2rem] font-medium ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="last_name"
                className={`pointer-events-none absolute left-0 font-label text-[1rem] uppercase tracking-[0.08em] transition-all duration-200 ${
                  lastName ? `top-0 scale-[0.8] ${guestTheme.text.primary}` : `top-5 ${guestTheme.text.base}/85`
                } peer-focus:top-0 peer-focus:scale-[0.8] ${guestTheme.text.primary}`}
              >
                {t.lastName}
              </label>
            </div>

            <div className={`relative border-b transition-colors focus-within:border-[var(--hcs-primary)] ${error ? `${guestTheme.border.error}/50` : `${guestTheme.border.base}/40`}`}>
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
                className={`peer block h-[4.1rem] w-full border-none bg-transparent px-0 pb-2 pt-6 text-[1.2rem] font-medium ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="phone_number"
                className={`pointer-events-none absolute left-0 font-label text-[1rem] uppercase tracking-[0.08em] transition-all duration-200 ${
                  phoneNumber ? `top-0 scale-[0.8] ${guestTheme.text.primary}` : `top-5 ${guestTheme.text.base}/85`
                } peer-focus:top-0 peer-focus:scale-[0.8] ${guestTheme.text.primary}`}
              >
                {t.phone}
              </label>
            </div>

            {error && <p className={`rounded-lg ${guestTheme.bg.errorSoft} px-4 py-3 text-sm ${guestTheme.text.error}`}>{error}</p>}

            <div className="pt-1">
              <button
                type="submit"
                disabled={!isValid}
                className={`flex h-16 w-full items-center justify-center rounded-md ${guestTheme.bg.primary} px-6 text-[1rem] font-semibold uppercase tracking-[0.18em] ${guestTheme.text.onPrimary} shadow-[0_14px_32px_rgba(119,90,25,0.18)] transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {t.accessDining}
              </button>
            </div>
          </form>

          <div className={`mt-10 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] ${guestTheme.text.muted}/70`}>
            <span>{t.assistance}</span>
            <span>{t.frontDesk}</span>
          </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};
