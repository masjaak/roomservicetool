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
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-6 bg-[#121212] relative z-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-sm mx-auto flex flex-col my-auto"
      >
        {/* Language toggle */}
        <div className="absolute -top-12 right-0 sm:-top-8">
          <div className="px-3 py-1 flex gap-3 text-[10px] uppercase font-bold tracking-widest text-[#f5f5f4]">
            <button onClick={() => setLang('ID')} className={lang === 'ID' ? 'text-white border-b border-white' : 'text-[#78716c]'}>ID</button>
            <button onClick={() => setLang('EN')} className={lang === 'EN' ? 'text-white border-b border-white' : 'text-[#78716c]'}>EN</button>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mb-12 mt-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-10 h-14 mx-auto mb-6 flex flex-col items-center justify-center border-2 border-white rounded-t-full relative"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
            <div className="w-0.5 h-3 bg-white mt-1" />
          </motion.div>
          <h1 className="text-[1.1rem] mb-4 uppercase tracking-[0.25em] text-white">
            Atelier Meridian
          </h1>
          <h2 className="text-[2rem] leading-none text-white tracking-wide" style={{ fontFamily: "'DM Serif Display', serif" }}>
            ROOM SERVICE
          </h2>
        </div>

        {/* Form card — solid background, no glassmorphism */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-6"
        >
          {/* Room Number */}
          <div className="text-left">
            <label className="text-[11px] font-bold tracking-[0.1em] text-[#a8a29e] mb-2 block">
              {t.room}
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="34B"
              value={roomNumber}
              onChange={(e) => {
                if (/^\d{0,4}[A-Za-z]?$/.test(e.target.value)) setRoomNumber(e.target.value.toUpperCase());
              }}
              className="block w-full px-5 py-4 bg-white text-[#121212] text-[1.2rem] font-bold focus:outline-none focus:ring-2 focus:ring-[#f5f5f4]/50 transition-all rounded-sm placeholder-[#d6d3d1]"
            />
          </div>

          {/* Last Name */}
          <div className="text-left">
            <label className="text-[11px] font-bold tracking-[0.1em] text-[#a8a29e] mb-2 block">
              {lang === 'ID' ? 'Nama Belakang' : 'Last Name'}
            </label>
            <input
              type="text"
              placeholder="ANDERSON"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.toUpperCase())}
              className="block w-full px-5 py-4 bg-white text-[#121212] text-[1.2rem] font-bold focus:outline-none focus:ring-2 focus:ring-[#f5f5f4]/50 transition-all rounded-sm uppercase placeholder-[#d6d3d1]"
            />
          </div>

          {/* Phone Number */}
          <div className="text-left">
            <label className="text-[11px] font-bold tracking-[0.1em] text-[#a8a29e] mb-2 block">
              {t.phone}
            </label>
            <input
              type="tel"
              placeholder="+1 (212) 555-0199"
              value={phoneNumber}
              onChange={(e) => {
                if (/^[\d+\-\s()]*$/.test(e.target.value)) setPhoneNumber(e.target.value);
              }}
              className="block w-full px-5 py-4 bg-white text-[#121212] text-[1.2rem] font-bold focus:outline-none focus:ring-2 focus:ring-[#fca5a5] transition-all rounded-sm placeholder-[#d6d3d1]"
              style={{
                outline: error ? '2px solid #ef4444' : 'none'
              }}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-[11px] font-bold tracking-widest uppercase text-[#fca5a5] py-1"
            >
              {error}
            </motion.p>
          )}

          <div className="pt-6">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="w-full py-5 bg-white text-[#121212] font-bold text-[14px] tracking-[0.15em] uppercase transition-all active:scale-[0.98] disabled:opacity-40 disabled:bg-[#a8a29e] rounded-sm hover:bg-[#f5f5f4]"
            >
              START ORDER
            </button>
          </div>

          <p className="text-center text-[10px] mt-6 tracking-widest uppercase cursor-pointer text-[#a8a29e] hover:text-white transition-all">
            {lang === 'ID'
              ? 'Butuh bantuan? Hubungi Resepsionis.'
              : 'Need assistance? Contact Concierge.'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};