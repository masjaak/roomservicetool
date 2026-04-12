import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../data/constants';
import { Language, FeedbackPayload } from '../types';

interface RatingModalProps {
  isOpen: boolean;
  onRate: (payload: FeedbackPayload) => void;
  onSkip?: () => void;
  lang: Language;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onRate, onSkip, lang }) => {
  const [overallRating, setOverallRating] = useState(0);
  const [foodQuality, setFoodQuality] = useState(0);
  const [presentation, setPresentation] = useState(0);
  const [deliverySpeed, setDeliverySpeed] = useState(0);
  const [orderAccuracy, setOrderAccuracy] = useState(0);
  const [staffCourtesy, setStaffCourtesy] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);
  
  const [wouldOrderAgain, setWouldOrderAgain] = useState<'yes' | 'no' | undefined>();
  const [comment, setComment] = useState('');

  const [requestManagerFollowUp, setRequestManagerFollowUp] = useState<'yes' | 'no'>('no');
  const [issueCategory, setIssueCategory] = useState<FeedbackPayload['issueCategory']>();
  const [issueNote, setIssueNote] = useState('');

  const t = TRANSLATIONS[lang];
  const accentColor = '#8a7648';

  const handleSubmit = () => {
    onRate({
      overallRating,
      foodQuality,
      presentation,
      deliverySpeed,
      orderAccuracy,
      staffCourtesy,
      valueForMoney,
      wouldOrderAgain,
      comment,
      ...(overallRating <= 3 && {
        requestManagerFollowUp,
        issueCategory,
        issueNote
      })
    });
  };

  const StarRow = ({ label, value, setter }: { label: string, value: number, setter: (v: number) => void }) => (
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold" style={{ color: '#555' }}>{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setter(n)} className="p-1">
            <Star
              className="w-5 h-5 transition-colors"
              style={{
                color: n <= value ? accentColor : '#e5e0d8',
                fill: n <= value ? accentColor : 'transparent',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: 'rgba(45,45,45,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-xl border overflow-hidden relative max-h-[90vh] flex flex-col"
            style={{ backgroundColor: '#fcfaf7', boxShadow: '0 28px 80px rgba(0,0,0,0.22)', borderRadius: '1px', borderColor: 'rgba(26,26,26,0.1)' }}
          >
            <div className="h-1 flex-shrink-0" style={{ backgroundColor: '#1a1a1a' }} />

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <button
                onClick={() => onSkip && onSkip()}
                className="absolute top-4 right-4 p-2 rounded-full z-10"
                style={{ backgroundColor: 'rgba(26,26,26,0.05)', borderRadius: '1px' }}
              >
                <X className="w-4 h-4" style={{ color: '#b8a898' }} />
              </button>

              <div className="text-center mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: '#8a7648' }}>
                  {lang === 'ID' ? 'Penutup layanan' : 'Service close'}
                </p>
                <h3 className="text-[2rem] font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a', fontWeight: 600 }}>
                  {t.rateTitle}
                </h3>
                <p className="text-xs" style={{ color: '#b8a898' }}>
                  {lang === 'ID' ? 'Masukan Anda membantu kami meningkatkan kualitas.' : 'Your feedback helps us improve.'}
                </p>
              </div>

              {/* Overall Rating */}
              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setOverallRating(n)}
                    className="p-2 transition-all hover:bg-black/5"
                  >
                    <Star
                      className={`w-8 h-8 transition-all ${n <= overallRating ? 'scale-110' : ''}`}
                      style={{
                        color: n <= overallRating ? accentColor : '#d4ccbf',
                        fill: n <= overallRating ? accentColor : 'transparent',
                      }}
                    />
                  </button>
                ))}
              </div>

              {overallRating > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6"
                >
                  <div className="p-4" style={{ backgroundColor: '#fff', border: '1px solid rgba(26,26,26,0.1)', borderRadius: '1px' }}>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: '#888' }}>
                      {lang === 'ID' ? 'Kualitas Layanan' : 'Service Quality'}
                    </h4>
                    <StarRow label={lang === 'ID' ? 'Kualitas Makanan' : 'Food Quality'} value={foodQuality} setter={setFoodQuality} />
                    <StarRow label={lang === 'ID' ? 'Presentasi' : 'Presentation'} value={presentation} setter={setPresentation} />
                    <StarRow label={lang === 'ID' ? 'Kecepatan Antar' : 'Delivery Speed'} value={deliverySpeed} setter={setDeliverySpeed} />
                    <StarRow label={lang === 'ID' ? 'Akurasi Pesanan' : 'Order Accuracy'} value={orderAccuracy} setter={setOrderAccuracy} />
                    <StarRow label={lang === 'ID' ? 'Kesopanan Staf' : 'Staff Courtesy'} value={staffCourtesy} setter={setStaffCourtesy} />
                    <StarRow label={lang === 'ID' ? 'Nilai Uang' : 'Value for Money'} value={valueForMoney} setter={setValueForMoney} />
                  </div>

                  {overallRating <= 3 && (
                    <div className="p-5 border bg-[#fff]" style={{ borderColor: 'rgba(26,26,26,0.1)', borderRadius: '1px' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#c45050' }}>
                        {lang === 'ID' ? 'Kami Mohon Maaf' : 'We apologize'}
                      </p>
                      
                      <div className="mb-4">
                        <label className="text-[9px] font-bold uppercase tracking-widest block mb-2" style={{ color: '#888' }}>
                          {lang === 'ID' ? 'Kategori Kendala' : 'Issue Category'}
                        </label>
                        <select 
                          className="w-full p-3 text-sm bg-white border outline-none appearance-none"
                          style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1a1a1a', borderRadius: '1px' }}
                          value={issueCategory || ''}
                          onChange={(e) => setIssueCategory(e.target.value as any)}
                        >
                          <option value="" disabled>{lang === 'ID' ? 'Pilih kategori...' : 'Select a category...'}</option>
                          <option value="Food quality">Food quality</option>
                          <option value="Temperature">Temperature</option>
                          <option value="Late delivery">Late delivery</option>
                          <option value="Wrong item">Wrong item</option>
                          <option value="Packaging">Packaging</option>
                          <option value="Staff service">Staff service</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="text-[9px] font-bold uppercase tracking-widest block mb-2" style={{ color: '#888' }}>
                          {lang === 'ID' ? 'Detail Kendala' : 'Issue Detail'}
                        </label>
                        <input 
                          type="text" 
                          placeholder="..." 
                          value={issueNote}
                          onChange={(e) => setIssueNote(e.target.value)}
                          className="w-full p-3 text-sm bg-white border outline-none"
                          style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1a1a1a', borderRadius: '1px' }}
                        />
                      </div>

                      <label className="flex items-center gap-3 mt-4 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={requestManagerFollowUp === 'yes'}
                          onChange={(e) => setRequestManagerFollowUp(e.target.checked ? 'yes' : 'no')}
                          className="w-4 h-4 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                        />
                        <span className="text-xs font-semibold" style={{ color: '#1a1a1a' }}>
                          {lang === 'ID' ? 'Minta Manajer Menghubungi Saya' : 'Request Manager Follow-up'}
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="pt-4 border-t" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-3 text-center" style={{ color: '#888' }}>
                      {lang === 'ID' ? 'Akan pesan lagi?' : 'Would you order again?'}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setWouldOrderAgain('yes')}
                        className="flex-1 py-3 text-[11px] font-bold tracking-widest uppercase transition-all border"
                        style={wouldOrderAgain === 'yes' ? { backgroundColor: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a', borderRadius: '1px' } : { backgroundColor: 'transparent', color: '#1a1a1a', borderColor: 'rgba(26,26,26,0.1)', borderRadius: '1px' }}
                      >
                        {lang === 'ID' ? 'YA' : 'YES'}
                      </button>
                      <button 
                        onClick={() => setWouldOrderAgain('no')}
                        className="flex-1 py-3 text-[11px] font-bold tracking-widest uppercase transition-all border"
                        style={wouldOrderAgain === 'no' ? { backgroundColor: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a', borderRadius: '1px' } : { backgroundColor: 'transparent', color: '#1a1a1a', borderColor: 'rgba(26,26,26,0.1)', borderRadius: '1px' }}
                      >
                        {lang === 'ID' ? 'TIDAK' : 'NO'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={lang === 'ID' ? 'Komentar tambahan (opsional)...' : 'Additional comments (optional)...'}
                    rows={2}
                    className="w-full p-4 text-sm resize-none focus:outline-none transition-all placeholder:text-gray-300 border"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(26,26,26,0.1)',
                      color: '#1a1a1a',
                      borderRadius: '1px'
                    }}
                  />

                  <div className="pt-2">
                    <button
                      onClick={handleSubmit}
                      className="w-full py-4 font-bold text-sm tracking-widest uppercase transition-all active:scale-[0.98]"
                      style={{ backgroundColor: '#1a1a1a', color: '#fbfaf8', border: '1px solid transparent', borderRadius: '1px' }}
                    >
                      {t.submit}
                    </button>
                    <button
                      onClick={() => onSkip && onSkip()}
                      className="w-full py-3 mt-2 text-[10px] font-bold tracking-widest uppercase transition-all"
                      style={{ color: '#888' }}
                    >
                      {lang === 'ID' ? 'Lewati' : 'Skip'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
