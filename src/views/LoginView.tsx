import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { validateGuestAccess } from './loginValidation';

interface LoginViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogin: (room: string, phone: string, lastName: string) => Promise<string | null | void> | string | null | void;
}

const loginHeroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAkd7RklJ7B8ol4y2KFLFG-AXLVRW0GmuiRe-f2PVr_OsOU7bli6263fxf1QuvywDKHLYtg5aiUMiIw0KBiRJNKK4cYa8a1mO2MOowmwxTRxYjIES1kCts-Ol6OI6GXr8S1dDxNmL0Vt80Yo-9t6FgE5xWtNg7bYSRQj7U_E2qyiwUW-NK9pOY6QUzapco6F0x2scioqJuSjkUjHInSIeww_wvR0GA8rOFc3RAY21FhDU-UPwzN1ZIklThbrKkcZn9KOqeq051ciw';

export const LoginView: React.FC<LoginViewProps> = ({ lang, setLang, onLogin }) => {
  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const lastNameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const validation = validateGuestAccess({ roomNumber, lastName, phoneNumber, lang });
    setIsValid(validation.isValid);
    setError(validation.error);
  }, [roomNumber, phoneNumber, lastName, lang]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !/jsdom/i.test(navigator.userAgent)) {
      window.scrollTo(0, 0);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitError = await onLogin(roomNumber, phoneNumber, lastName);
      setError(submitError || '');
    } catch {
      setError(
        lang === 'ID'
          ? 'Verifikasi tamu gagal. Silakan periksa kembali detail Anda dan coba lagi.'
          : 'Guest verification failed. Please review your details and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveFocus = (e: React.KeyboardEvent<HTMLInputElement>, next?: HTMLInputElement | null) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (next) { next.focus(); return; }
    handleSubmit();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: '#0d0c0b',
        fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Background image */}
      <img
        src={loginHeroImage}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      {/* Content layer — flex column, full height */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '28rem',
          marginInline: 'auto',
        }}
      >
        {/* Spacer to push card toward bottom */}
        <div style={{ flex: 1 }} />

        {/* Glass card — sits at bottom */}
        <motion.section
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55 }}
          style={{
            marginLeft: '1rem',
            marginRight: '1rem',
            marginBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
            borderRadius: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'linear-gradient(145deg, rgba(34,27,22,0.52), rgba(255,255,255,0.1))',
            backdropFilter: 'blur(34px)',
            WebkitBackdropFilter: 'blur(34px)',
            boxShadow: '0 28px 70px rgba(8,7,7,0.4)',
            paddingTop: '1.75rem',
            paddingBottom: '1.5rem',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Glass sheen layers */}
          <div
            aria-hidden="true"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.14) 100%)',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              right: '-2.5rem',
              top: '0.5rem',
              width: '8rem',
              height: '8rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.1)',
              filter: 'blur(48px)',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              left: '-2rem',
              bottom: '4rem',
              width: '6rem',
              height: '6rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.07)',
              filter: 'blur(40px)',
            }}
          />
          {/* top highlight line */}
          <div
            aria-hidden="true"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              top: 0,
              left: '1.25rem',
              right: '1.25rem',
              height: '1px',
              background: 'rgba(255,255,255,0.4)',
            }}
          />
          {/* inner border */}
          <div
            aria-hidden="true"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: '1px',
              borderRadius: 'calc(2rem - 1px)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          />

          {/* Card content */}
          <div style={{ position: 'relative', paddingLeft: '2rem', paddingRight: '2rem' }}>
            {/* Title + body */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h2
                style={{
                  marginBottom: '0.5rem',
                  fontFamily: "'Noto Serif', serif",
                  fontSize: '2.05rem',
                  fontWeight: 400,
                  lineHeight: 1,
                  color: '#ffffff',
                  margin: '0 0 0.5rem 0',
                }}
              >
                {t.loginTitle}
              </h2>
              <p
                style={{
                  maxWidth: '16.8rem',
                  fontSize: '13px',
                  lineHeight: 1.68,
                  color: 'rgba(255,255,255,0.72)',
                  margin: 0,
                }}
              >
                {t.loginBody}
              </p>
            </div>

            {/* Form */}
            <form
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
            >
              {/* Room Number */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '1.1rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '0.75rem 1rem 0.75rem',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <label
                  htmlFor="room_number"
                  style={{
                    display: 'block',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.68)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {t.room}
                </label>
                <input
                  id="room_number"
                  ref={roomInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  enterKeyHint="next"
                  value={roomNumber}
                  onKeyDown={(e) => moveFocus(e, lastNameInputRef.current)}
                  onChange={(e) => {
                    if (/^\d{0,4}$/.test(e.target.value)) setRoomNumber(e.target.value);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#ffffff',
                    padding: 0,
                    lineHeight: 1.4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Last Name */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '1.1rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '0.75rem 1rem 0.75rem',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <label
                  htmlFor="last_name"
                  style={{
                    display: 'block',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.68)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {t.lastName}
                </label>
                <input
                  id="last_name"
                  ref={lastNameInputRef}
                  type="text"
                  autoComplete="family-name"
                  enterKeyHint="next"
                  value={lastName}
                  onKeyDown={(e) => moveFocus(e, phoneInputRef.current)}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#ffffff',
                    padding: 0,
                    lineHeight: 1.4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Phone Number */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '1.1rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '0.75rem 1rem 0.75rem',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <label
                  htmlFor="phone_number"
                  style={{
                    display: 'block',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.68)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {t.phone}
                </label>
                <input
                  id="phone_number"
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="done"
                  value={phoneNumber}
                  onKeyDown={(e) => moveFocus(e)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d+]/g, '');
                    setPhoneNumber(val);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#ffffff',
                    padding: 0,
                    lineHeight: 1.4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  style={{
                    borderRadius: '0.5rem',
                    background: '#ffdad6',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    color: '#93000a',
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              {/* CTA Button */}
              <div style={{ paddingTop: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    height: '58px',
                    borderRadius: '1rem',
                    border: 'none',
                    backgroundColor: '#9a7416',
                    color: '#ffffff',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    boxShadow: '0 18px 34px rgba(119,90,25,0.28), inset 0 1px 0 rgba(255,255,255,0.22)',
                    cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
                    opacity: 1,
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    transition: 'transform 0.15s',
                  }}
                >
                  <span>{isSubmitting ? (lang === 'ID' ? 'Memverifikasi Tamu' : 'Verifying Guest') : t.accessDining}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '9999px',
                      background: 'rgba(255,255,255,0.14)',
                      fontSize: '13px',
                      lineHeight: 1,
                    }}
                  >
                    →
                  </span>
                </button>
              </div>
            </form>

            {/* Footer links */}
            <div
              style={{
                marginTop: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>concierge</span>
                {t.assistance}
              </span>
              <a
                href="#"
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  textDecoration: 'none',
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                {t.frontDesk}
              </a>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Grain texture overlay */}
      <div
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          opacity: 0.03,
          mixBlendMode: 'overlay',
          backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')",
        }}
      />
    </div>
  );
};
