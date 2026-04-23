import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { validateGuestAccess } from './loginValidation';

interface LoginViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogin: (room: string, phone: string, lastName: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ lang, setLang, onLogin }) => {
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const lastNameInputRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // jsdom does not implement scrollTo; ignore in tests.
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const loginHeroImage =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAkd7RklJ7B8ol4y2KFLFG-AXLVRW0GmuiRe-f2PVr_OsOU7bli6263fxf1QuvywDKHLYtg5aiUMiIw0KBiRJNKK4cYa8a1mO2MOowmwxTRxYjIES1kCts-Ol6OI6GXr8S1dDxNmL0Vt80Yo-9t6FgE5xWtNg7bYSRQj7U_E2qyiwUW-NK9pOY6QUzapco6F0x2scioqJuSjkUjHInSIeww_wvR0GA8rOFc3RAY21FhDU-UPwzN1ZIklThbrKkcZn9KOqeq051ciw';

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
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#faf9f7] font-body text-[#1a1c1b] antialiased">
      <div className="relative mx-auto flex h-full max-w-md flex-col overflow-hidden bg-[#f4f3f1] shadow-xl">
        <main className="relative flex h-full flex-1 flex-col overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={loginHeroImage}
              className="h-full w-full object-cover"
              alt="Atelier Meridian Suite Interior"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90" />
          </div>

          <header className="relative z-10 px-8 pt-[calc(env(safe-area-inset-top)+4.8rem)] text-center">
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
            <p className="mb-4 font-label text-[9px] uppercase tracking-[0.34em] text-white/82">
              {lang === 'ID' ? 'Selamat datang di' : 'Welcome to'}
            </p>
            <h1 className="mx-auto max-w-[15rem] font-headline text-[2.5rem] font-normal italic leading-none tracking-[0.04em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.18)]">
              Atelier Meridian
            </h1>
          </header>

          <motion.section
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-10 overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(145deg,rgba(34,27,22,0.46),rgba(255,255,255,0.12))] pb-6 pt-7 shadow-[0_28px_70px_rgba(8,7,7,0.34)] backdrop-blur-[34px]"
            style={{ minHeight: '30rem' }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0.02)_42%,rgba(255,255,255,0.16))]" />
            <div className="pointer-events-none absolute -right-10 top-2 h-32 w-32 rounded-full bg-white/12 blur-3xl" />
            <div className="pointer-events-none absolute -left-8 bottom-16 h-24 w-24 rounded-full bg-white/8 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/40" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] border border-white/8" />
            <div className="relative">
              <div className="mb-7">
                <h2
                  className="mb-2 font-headline text-[2.05rem] leading-none text-white"
                  style={{ marginLeft: '2rem', marginRight: '2rem' }}
                >
                  {t.loginTitle}
                </h2>
                <p
                  className="max-w-[16.8rem] text-[13px] leading-[1.68] text-white/72"
                  style={{ marginLeft: '2rem', marginRight: '2rem' }}
                >
                  {t.loginBody}
                </p>
              </div>

              <form
                className="relative space-y-4"
                style={{ marginLeft: '2rem', marginRight: '2rem' }}
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="relative rounded-[1.1rem] border border-white/12 bg-white/8 px-4 pb-3 pt-3 transition-colors focus-within:border-white/36 focus-within:bg-white/[0.11]">
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
                    className="block h-[42px] w-full border-none bg-transparent px-0 pt-4 text-[15px] font-medium text-white placeholder-transparent focus:ring-0"
                  />
                  <label
                    htmlFor="room_number"
                    className={`pointer-events-none absolute left-4 top-3 font-label text-[10px] uppercase tracking-[0.18em] text-white/68 transition-all duration-200 ${
                      roomNumber ? '-translate-y-[0.55rem] scale-[0.92] text-white/82' : ''
                    }`}
                  >
                    {t.room}
                  </label>
                </div>

                <div className="relative rounded-[1.1rem] border border-white/12 bg-white/8 px-4 pb-3 pt-3 transition-colors focus-within:border-white/36 focus-within:bg-white/[0.11]">
                  <input
                    id="last_name"
                    ref={lastNameInputRef}
                    type="text"
                    autoComplete="family-name"
                    enterKeyHint="done"
                    value={lastName}
                    placeholder=" "
                    onKeyDown={(event) => moveFocusToNextField(event)}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block h-[42px] w-full border-none bg-transparent px-0 pt-4 text-[15px] font-medium text-white placeholder-transparent focus:ring-0"
                  />
                  <label
                    htmlFor="last_name"
                    className={`pointer-events-none absolute left-4 top-3 font-label text-[10px] uppercase tracking-[0.18em] text-white/68 transition-all duration-200 ${
                      lastName ? '-translate-y-[0.55rem] scale-[0.92] text-white/82' : ''
                    }`}
                  >
                    {t.lastName}
                  </label>
                </div>

                {error && <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{error}</p>}

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={!isValid}
                    className="appearance-none border-none flex h-[58px] w-full items-center justify-center gap-3 rounded-[1rem] px-6 py-5 font-label text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:text-white disabled:opacity-100"
                    style={{
                      WebkitAppearance: 'none',
                      backgroundColor: '#9a7416',
                      color: '#ffffff',
                      opacity: 1,
                      boxShadow: '0 18px 34px rgba(119, 90, 25, 0.28), inset 0 1px 0 rgba(255,255,255,0.22)',
                    }}
                  >
                    <span>{t.accessDining}</span>
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/14 text-[13px] leading-none"
                    >
                      →
                    </span>
                  </button>
                </div>
              </form>

              <div
                className="relative mt-7 flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-white/72"
                style={{ marginLeft: '2rem', marginRight: '2rem' }}
              >
                <span className="flex items-center gap-2 font-label">
                  <span className="material-symbols-outlined text-sm">concierge</span>
                  {t.assistance}
                </span>
                <a href="#" className="transition-colors hover:text-white">
                  {t.frontDesk}
                </a>
              </div>
            </div>
          </motion.section>
        </main>

        <div className="pointer-events-none absolute inset-0 z-[100] opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      </div>
    </div>
  );
};
