import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/constants';

interface LoginViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogin: (room: string, phone: string, lastName: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ lang, setLang, onLogin }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const isRoomValid = roomNumber.length > 0;
    const isNameValid = lastName.trim().length > 0;

    const digits = phoneNumber.replace(/\D/g, '');
    const isPhoneLengthValid = digits.length >= 10 && digits.length <= 14;
    const isPhonePrefixValid = digits.startsWith('08') || digits.startsWith('628');
    const isPhoneValid = isPhoneLengthValid && isPhonePrefixValid;

    setIsValid(isRoomValid && isNameValid && isPhoneValid);

    if (phoneNumber && !isPhoneValid) {
      if (!isPhonePrefixValid) {
        setError(lang === 'ID' ? 'Nomor harus diawali 08 atau 628' : 'Number must start with 08 or 628');
      } else if (!isPhoneLengthValid) {
        setError(lang === 'ID' ? 'Nomor HP tidak valid (Min. 10 digit)' : 'Invalid phone number (min. 10 digits)');
      }
    } else {
      setError('');
    }
  }, [roomNumber, phoneNumber, lastName, lang]);

  const handleSubmit = () => {
    if (isValid) {
      onLogin(roomNumber, phoneNumber, lastName);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center py-10 px-6 overflow-y-auto relative" style={{ backgroundColor: '#2d2d2d' }}>
      {/* Background image with dark wash — no gradient */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <img
          src="/assets/hero.jpg"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-auto flex flex-col my-auto"
      >
        {/* Language toggle */}
        <div className="absolute -top-10 right-0 sm:top-0">
          <div className="px-3 py-1 rounded-full flex gap-3 text-[10px] font-medium cursor-pointer" style={{ backgroundColor: 'rgba(45,45,45,0.6)', border: '1px solid rgba(250,248,245,0.15)', color: '#faf8f5' }}>
            <button onClick={() => setLang('ID')} className={lang === 'ID' ? 'font-bold opacity-100' : 'opacity-50'}>ID</button>
            <span style={{ opacity: 0.2 }}>|</span>
            <button onClick={() => setLang('EN')} className={lang === 'EN' ? 'font-bold opacity-100' : 'opacity-50'}>EN</button>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-5 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#faf8f5' }}
          >
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#2d2d2d', fontWeight: 'bold' }}>AM</span>
          </motion.div>
          <h1 className="text-2xl mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: '#faf8f5', letterSpacing: '0.02em' }}>
            Atelier Meridian
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(250,248,245,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Form card — solid background, no glassmorphism */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-6 py-6 rounded-2xl w-full"
          style={{ backgroundColor: 'rgba(45,45,45,0.85)', border: '1px solid rgba(250,248,245,0.1)' }}
        >
          <div className="space-y-4">
            {/* Room Number */}
            <div>
              <label className="text-[10px] font-semibold tracking-widest uppercase mb-2 block ml-1" style={{ color: 'rgba(250,248,245,0.6)' }}>
                {t.room}
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1024"
                value={roomNumber}
                onChange={(e) => {
                  if (/^\d{0,4}$/.test(e.target.value)) setRoomNumber(e.target.value);
                }}
                className="block w-full px-4 py-3 rounded-xl text-base text-center font-medium tracking-widest focus:outline-none transition-all"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(250,248,245,0.1)', color: '#faf8f5', '--placeholder-color': 'rgba(250,248,245,0.3)' } as React.CSSProperties}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="text-[10px] font-semibold tracking-widest uppercase mb-2 block ml-1" style={{ color: 'rgba(250,248,245,0.6)' }}>
                {lang === 'ID' ? 'Nama Belakang (Sesuai Reservasi)' : 'Last Name (As per Reservation)'}
              </label>
              <input
                type="text"
                placeholder={lang === 'ID' ? 'Contoh: Santoso' : 'Ex: Smith'}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl text-base text-center font-medium tracking-widest capitalize focus:outline-none transition-all"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(250,248,245,0.1)', color: '#faf8f5' }}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[10px] font-semibold tracking-widest uppercase mb-2 block ml-1" style={{ color: 'rgba(250,248,245,0.6)' }}>
                {t.phone}
              </label>
              <input
                type="tel"
                placeholder="081..."
                value={phoneNumber}
                onChange={(e) => {
                  if (/^\d{0,14}$/.test(e.target.value)) setPhoneNumber(e.target.value);
                }}
                className="block w-full px-4 py-3 rounded-xl text-base text-center font-medium tracking-widest focus:outline-none transition-all"
                style={{
                  backgroundColor: error ? 'rgba(180,60,60,0.15)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${error ? 'rgba(180,60,60,0.4)' : 'rgba(250,248,245,0.1)'}`,
                  color: '#faf8f5',
                }}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-center font-semibold py-2 rounded-lg"
                style={{ color: '#e8a0a0', backgroundColor: 'rgba(180,60,60,0.2)', border: '1px solid rgba(180,60,60,0.2)' }}
              >
                {error}
              </motion.p>
            )}

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="w-full py-4 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#faf8f5', color: '#2d2d2d' }}
              >
                {t.start}
              </button>

              <p className="text-center text-[10px] mt-3 leading-relaxed px-4" style={{ color: 'rgba(250,248,245,0.45)' }}>
                {lang === 'ID'
                  ? 'Demi keamanan, pesanan akan diverifikasi dengan data tamu di resepsionis.'
                  : 'For security, orders will be verified against guest records at reception.'}
              </p>
            </div>

            <p className="text-center text-[10px] mt-1 cursor-pointer hover:underline transition-all" style={{ color: 'rgba(250,248,245,0.4)' }}>
              {t.help}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};