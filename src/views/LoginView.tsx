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
      <div className="relative min-h-screen overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,34rem)]">
        <div className="absolute inset-0 lg:relative lg:min-h-screen">
          <img src="/assets/hero.jpg" className="h-full w-full object-cover" alt="" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,28,27,0.46)_0%,rgba(26,28,27,0.16)_26%,rgba(26,28,27,0.58)_100%)]" />
        </div>

        <div className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between px-6 pb-4 pt-6 hcs-safe-top lg:left-auto lg:right-10 lg:top-10 lg:justify-end lg:px-0 lg:pb-0 lg:pt-0">
          <div className="lg:hidden" />
          <div className="rounded-full bg-[color:rgba(250,249,247,0.18)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/95">
            <button onClick={() => setLang('ID')} className={lang === 'ID' ? 'opacity-100' : 'opacity-60'}>
              ID
            </button>
            <span className="mx-2 opacity-40">/</span>
            <button onClick={() => setLang('EN')} className={lang === 'EN' ? 'opacity-100' : 'opacity-60'}>
              EN
            </button>
          </div>
        </div>

        <header className="relative z-10 px-6 pt-20 text-center text-white lg:flex lg:min-h-screen lg:flex-col lg:items-center lg:justify-center lg:px-14 lg:pt-0">
          <div
            data-testid="login-hero-glass"
            className="hidden max-w-[24rem] bg-white/[0.34] backdrop-blur-[40px] lg:max-w-[39rem]"
            aria-hidden="true"
          >
            <div
              data-testid="login-hero-glass-frame"
              className="hidden inset-[10px] rounded-[2.35rem] border border-white/32"
              aria-hidden="true"
            />
            <div
              data-testid="login-hero-glass-sheen"
              className="hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.34),rgba(255,255,255,0.08))]"
              aria-hidden="true"
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/78 lg:text-[11px]">
            {lang === 'ID' ? 'Selamat datang di' : 'Welcome to'}
          </p>
          <h1 className="mt-5 font-headline text-[3.7rem] italic leading-none tracking-[0.03em] text-white lg:text-[5.8rem]">
            Atelier Meridian
          </h1>
        </header>

        <div className="relative z-10 flex min-h-screen flex-col justify-end lg:min-h-0 lg:bg-[var(--hcs-background)] lg:px-8 lg:py-8">

          <motion.section
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55 }}
            className={`relative z-10 rounded-t-[2.8rem] ${guestTheme.bg.surface} px-8 pb-10 pt-10 shadow-[0_-18px_40px_rgba(26,28,27,0.1)] lg:my-auto lg:rounded-[2rem] lg:px-10 lg:pb-10 lg:pt-10 lg:shadow-[0_18px_60px_rgba(26,28,27,0.08)]`}
          >
          <div className="mb-8">
            <h2 className={`font-headline text-[2.6rem] leading-[1.04] ${guestTheme.text.base} lg:text-[2.75rem]`}>{t.loginTitle}</h2>
            <p className={`mt-4 max-w-[22rem] text-[0.98rem] leading-[1.6] ${guestTheme.text.muted} lg:max-w-[24rem] lg:text-[1rem]`}>
              {t.loginBody}
            </p>
          </div>

          <form
            className="space-y-7"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <div className={`relative border-b ${guestTheme.border.base}/60 pb-1 transition-colors focus-within:border-[var(--hcs-primary)]`}>
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
                className={`peer block h-[4.25rem] w-full border-none bg-transparent px-0 pb-2 pt-5 text-[1.05rem] font-medium tracking-[0.01em] ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="room_number"
                className={`pointer-events-none absolute left-0 font-label text-[0.98rem] uppercase tracking-[0.08em] transition-all duration-200 ${
                  roomNumber ? `top-0 scale-[0.8] ${guestTheme.text.primary}` : `top-4.5 ${guestTheme.text.base}/85`
                } peer-focus:top-0 peer-focus:scale-[0.8] ${guestTheme.text.primary}`}
              >
                {t.room}
              </label>
            </div>

            <div className={`relative border-b ${guestTheme.border.base}/60 pb-1 transition-colors focus-within:border-[var(--hcs-primary)]`}>
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
                className={`peer block h-[4.25rem] w-full border-none bg-transparent px-0 pb-2 pt-5 text-[1.05rem] font-medium tracking-[0.01em] ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="last_name"
                className={`pointer-events-none absolute left-0 font-label text-[0.98rem] uppercase tracking-[0.08em] transition-all duration-200 ${
                  lastName ? `top-0 scale-[0.8] ${guestTheme.text.primary}` : `top-4.5 ${guestTheme.text.base}/85`
                } peer-focus:top-0 peer-focus:scale-[0.8] ${guestTheme.text.primary}`}
              >
                {t.lastName}
              </label>
            </div>

            <div className={`relative border-b transition-colors focus-within:border-[var(--hcs-primary)] ${error ? `${guestTheme.border.error}/50` : `${guestTheme.border.base}/60`}`}>
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
                className={`peer block h-[4.25rem] w-full border-none bg-transparent px-0 pb-2 pt-5 text-[1.05rem] font-medium tracking-[0.01em] ${guestTheme.text.base} placeholder-transparent focus:ring-0`}
              />
              <label
                htmlFor="phone_number"
                className={`pointer-events-none absolute left-0 font-label text-[0.98rem] uppercase tracking-[0.08em] transition-all duration-200 ${
                  phoneNumber ? `top-0 scale-[0.8] ${guestTheme.text.primary}` : `top-4.5 ${guestTheme.text.base}/85`
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
                className={`flex h-16 w-full items-center justify-center rounded-md ${guestTheme.bg.primary} px-6 text-[0.98rem] font-semibold uppercase tracking-[0.16em] ${guestTheme.text.onPrimary} shadow-[0_18px_34px_rgba(119,90,25,0.18)] transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {t.accessDining}
              </button>
            </div>
          </form>

          <div className={`mt-10 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.16em] ${guestTheme.text.muted}/75`}>
            <span>{t.assistance}</span>
            <span>{t.frontDesk}</span>
          </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};
