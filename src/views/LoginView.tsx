import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/constants';

interface LoginViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogin: (room: string, phone: string, lastName: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ lang, setLang, onLogin }) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const t = TRANSLATIONS[lang];

  // Validation Logic
  useEffect(() => {
    // 1. Room Number: Must be filled (simple check, max 4 digits handled by input)
    const isRoomValid = roomNumber.length > 0;

    // 2. Last Name: Must be filled
    const isNameValid = lastName.trim().length > 0;

    // 3. Phone Number: 
    // - Numeric only
    // - Min 10, Max 14 digits
    // - Starts with '08' or '628'
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    const isPhoneLengthValid = phoneDigits.length >= 10 && phoneDigits.length <= 14;
    const isPhonePrefixValid = phoneDigits.startsWith('08') || phoneDigits.startsWith('628');
    const isPhoneValid = isPhoneLengthValid && isPhonePrefixValid;

    setIsValid(isRoomValid && isNameValid && isPhoneValid);

    // Specific error messages for UX
    if (phoneNumber && !isPhoneValid) {
        if (!isPhonePrefixValid) setError(lang === 'ID' ? "Nomor harus diawali 08 atau 628" : "Number must start with 08 or 628");
        else if (!isPhoneLengthValid) setError(lang === 'ID' ? "Nomor HP tidak valid (Min. 10 digit)" : "Invalid Phone Number (Min. 10 digits)");
    } else {
        setError("");
    }

  }, [roomNumber, phoneNumber, lastName, lang]);

  const handleSubmit = () => {
    if (isValid) {
      onLogin(roomNumber, phoneNumber, lastName);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col justify-center items-center p-6 font-sans overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1763604584073-7f05efb157f9?q=80&w=1674&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-70" 
          alt="Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full justify-center"
      >
        <div className="absolute top-8 right-0">
          <div className="bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex gap-3 text-[10px] font-medium text-white shadow-lg cursor-pointer hover:bg-black/40 transition-all">
            <button onClick={() => setLang('ID')} className={`${lang === 'ID' ? 'text-white font-bold' : 'text-white/50'}`}>ID</button>
            <span className="text-white/20">|</span>
            <button onClick={() => setLang('EN')} className={`${lang === 'EN' ? 'text-white font-bold' : 'text-white/50'}`}>EN</button>
          </div>
        </div>

        <div className="text-center mb-6">
           <motion.img 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.2 }}
             src="https://i.ibb.co.com/JFzbjBqz/Logo-ciputra-copy.png" 
             className="w-24 h-auto mx-auto mb-4 object-contain drop-shadow-2xl opacity-95" 
             alt="Logo" 
           />
           <h1 className="text-3xl font-serif text-white drop-shadow-lg tracking-wide mb-2">The Gallery Restaurant</h1>
           <p className="text-white/80 text-xs mt-1 font-serif italic">"{lang === 'EN' ? 'Exquisite dining, delivered to your room' : 'Hidangan istimewa, diantar ke kamar Anda'}"</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-6 rounded-[1.5rem] shadow-2xl ring-1 ring-white/30 w-full"
        >
          <div className="space-y-4"> 
            
            {/* Room Number */}
            <div className="group">
              <label className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase mb-2 block ml-1">{t.room}</label>
              <input 
                type="text" 
                inputMode="numeric" 
                placeholder="1024" 
                value={roomNumber} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,4}$/.test(val)) setRoomNumber(val);
                }} 
                className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-black/40 focus:border-white/30 transition-all text-base text-center font-medium tracking-widest" 
              />
            </div>

            {/* Last Name (New Field) */}
            <div className="group">
              <label className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase mb-2 block ml-1">
                {lang === 'ID' ? "Nama Belakang (Sesuai Reservasi)" : "Last Name (As per Reservation)"}
              </label>
              <input 
                type="text" 
                placeholder={lang === 'ID' ? "Contoh: Santoso" : "Ex: Smith"} 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-black/40 focus:border-white/30 transition-all text-base text-center font-medium tracking-widest capitalize" 
              />
            </div>

            {/* Phone Number */}
            <div className="group">
              <label className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase mb-2 block ml-1">{t.phone}</label>
              <input 
                type="tel" 
                placeholder="081..." 
                value={phoneNumber} 
                onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,14}$/.test(val)) setPhoneNumber(val);
                }} 
                className={`block w-full px-4 py-3 bg-black/20 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-black/40 transition-all text-base text-center font-medium tracking-widest ${error ? 'border-red-400/50 bg-red-900/10' : 'border-white/10 focus:border-white/30'}`}
              />
            </div>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-300 text-xs text-center font-bold bg-red-900/40 py-2 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.p>
            )}
            
            <div className="pt-2">
              <button 
                onClick={handleSubmit} 
                disabled={!isValid}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-900 hover:bg-slate-100 py-4 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all uppercase tracking-widest"
              >
                {t.start}
              </button>
              
              {/* Security Warning */}
              <p className="text-center text-[10px] text-white/60 mt-3 leading-relaxed px-4">
                {lang === 'ID' 
                  ? "Demi keamanan, pesanan akan diverifikasi dengan data tamu di Resepsionis." 
                  : "For security, orders will be verified against Guest Data at Reception."}
              </p>
            </div>
            
            <p className="text-center text-[10px] text-white/50 mt-1 cursor-pointer hover:text-white hover:underline transition-all">{t.help}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};