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
  const accentColor = '#a08850';

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
            className="w-full max-w-lg rounded-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
            style={{ backgroundColor: '#faf8f5' }}
          >
            <div className="h-1 flex-shrink-0" style={{ backgroundColor: '#2d2d2d' }} />

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <button
                onClick={() => onSkip && onSkip()}
                className="absolute top-4 right-4 p-2 rounded-full z-10"
                style={{ backgroundColor: 'rgba(45,45,45,0.05)' }}
              >
                <X className="w-4 h-4" style={{ color: '#b8a898' }} />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
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
                    className="p-2 rounded-full transition-all hover:bg-black/5"
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
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
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
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(180,60,60,0.05)', border: '1px solid rgba(180,60,60,0.1)' }}>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: '#b43c3c' }}>
                        {lang === 'ID' ? 'PEMULIHAN LAYANAN' : 'Service Recovery'}
                      </h4>
                      
                      <div className="mb-4">
                        <label className="text-xs font-semibold block mb-2" style={{ color: '#555' }}>
                          {lang === 'ID' ? 'Kategori Kendala' : 'Issue Category'}
                        </label>
                        <select 
                          className="w-full p-2.5 rounded-lg text-sm bg-white border outline-none"
                          style={{ borderColor: 'rgba(0,0,0,0.1)' }}
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
                        <label className="text-xs font-semibold block mb-2" style={{ color: '#555' }}>
                          {lang === 'ID' ? 'Detail Kendala' : 'Issue Detail'}
                        </label>
                        <input 
                          type="text" 
                          placeholder="..." 
                          value={issueNote}
                          onChange={(e) => setIssueNote(e.target.value)}
                          className="w-full p-2.5 rounded-lg text-sm bg-white border outline-none"
                        />
                      </div>

                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={requestManagerFollowUp === 'yes'}
                          onChange={(e) => setRequestManagerFollowUp(e.target.checked ? 'yes' : 'no')}
                          className="w-4 h-4 rounded text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium" style={{ color: '#555' }}>
                          {lang === 'ID' ? 'Minta Manajer Menghubungi Saya' : 'Request Manager Follow-up'}
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex gap-2 p-4 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <div className="flex-1">
                      <span className="text-xs font-semibold block mb-2" style={{ color: '#555' }}>
                        {lang === 'ID' ? 'Akan pesan lagi?' : 'Would you order again?'}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setWouldOrderAgain('yes')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${wouldOrderAgain === 'yes' ? 'bg-[#2d2d2d] text-white' : 'bg-white text-[#555] border'}`}
                        >
                          {lang === 'ID' ? 'YA' : 'YES'}
                        </button>
                        <button 
                          onClick={() => setWouldOrderAgain('no')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${wouldOrderAgain === 'no' ? 'bg-[#2d2d2d] text-white' : 'bg-white text-[#555] border'}`}
                        >
                          {lang === 'ID' ? 'TIDAK' : 'NO'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={lang === 'ID' ? 'Komentar tambahan (opsional)...' : 'Additional comments (optional)...'}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(45,45,45,0.04)',
                      border: '1px solid rgba(45,45,45,0.08)',
                      color: '#2d2d2d',
                    }}
                  />

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSubmit}
                      className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-md active:scale-[0.98]"
                      style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}
                    >
                      {t.submit}
                    </button>
                    <button
                      onClick={() => onSkip && onSkip()}
                      className="w-full py-3 rounded-xl font-bold text-xs tracking-widest uppercase transition-all active:scale-[0.98]"
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
