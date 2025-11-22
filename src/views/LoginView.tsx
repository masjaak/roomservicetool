import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/constants';

interface LoginViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogin: (room: string, phone: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ lang, setLang, onLogin }) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const t = TRANSLATIONS[lang];

  const handleSubmit = () => {
    if (!roomNumber || !phoneNumber) {
      setError("Please fill in all fields");
      return;
    }
    onLogin(roomNumber, phoneNumber);
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

        <div className="text-center mb-8">
           <motion.img 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.2 }}
             src="https://i.ibb.co.com/JFzbjBqz/Logo-ciputra-copy.png" 
             className="w-28 h-auto mx-auto mb-5 object-contain drop-shadow-2xl opacity-95" 
             alt="Logo" 
           />
           <h1 className="text-4xl font-serif text-white drop-shadow-lg tracking-wide mb-2">The Gallery</h1>
           <p className="text-white/80 text-sm mt-2 font-serif italic">"{t.subtitle}"</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-8 rounded-[1.5rem] shadow-2xl ring-1 ring-white/30 w-full"
        >
          <div className="space-y-4"> 
            <div className="group">
              <label className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase mb-2 block ml-1">{t.room}</label>
              <input 
                type="number" 
                placeholder="1024" 
                value={roomNumber} 
                onChange={(e) => setRoomNumber(e.target.value)} 
                className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-black/40 focus:border-white/30 transition-all text-base text-center font-medium tracking-widest" 
              />
            </div>
            <div className="group">
              <label className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase mb-2 block ml-1">{t.phone}</label>
              <input 
                type="tel" 
                placeholder="081..." 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-black/40 focus:border-white/30 transition-all text-base text-center font-medium tracking-widest" 
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
            
            <div className="pt-4">
              <button 
                onClick={handleSubmit} 
                className="w-full bg-white text-slate-900 hover:bg-slate-100 py-4 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all uppercase tracking-widest"
              >
                {t.start}
              </button>
            </div>
            <p className="text-center text-[10px] text-white/50 mt-4 cursor-pointer hover:text-white hover:underline transition-all">{t.help}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
