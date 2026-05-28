import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PromoCampaign, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { useTheme } from '../contexts/ThemeContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { openWhatsAppOrder } from '../utils/whatsAppNavigation';

function buildPromoInquiryUrl(promo: PromoCampaign, lang: Language, staffPhone: string = '6281285864059'): string {
  const message = lang === 'ID'
    ? `Halo Room Service, saya ingin menanyakan promo *${promo.title.ID}*. Mohon info ketersediaan dan detail reservasinya.`
    : `Hello Room Service, I would like to enquire about the *${promo.title.EN}* offer. Please share the availability and reservation details.`;

  return `https://wa.me/${staffPhone}?text=${encodeURIComponent(message)}`;
}

interface PromoDetailModalProps {
  promo: PromoCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PromoDetailModal: React.FC<PromoDetailModalProps> = ({ promo, isOpen, onClose, lang }) => {
  const { theme } = useTheme();
  const t = TRANSLATIONS[lang];

  if (!promo) {
    return null;
  }

  const handlePromoInquiry = () => {
    const url = buildPromoInquiryUrl(promo, lang);
    openWhatsAppOrder({
      url,
      viewportWidth: window.innerWidth,
      openNewTab: (nextUrl) => window.open(nextUrl, '_blank', 'noopener,noreferrer'),
      replaceLocation: (nextUrl) => window.location.assign(nextUrl),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,0.68)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          />
          <div style={{ position: 'fixed', inset: 0, zIndex: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                style={{ pointerEvents: 'auto', width: 'calc(100% - 2rem)', maxWidth: '26rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: theme.bgSurface, borderRadius: '1.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}
              >
                <div style={{ position: 'relative', aspectRatio: '16/10', background: theme.bgMuted, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close promo"
                  style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 2, width: '2.25rem', height: '2.25rem', borderRadius: '9999px', border: 'none', background: 'rgba(0,0,0,0.48)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
                <ImageWithFallback src={promo.image} alt={promo.title[lang]} className="h-full w-full object-cover" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.18) 100%)' }} />
                <div style={{ position: 'absolute', left: '1.25rem', right: '1.25rem', bottom: '1.25rem' }}>
                  <span style={{ display: 'inline-flex', marginBottom: '0.6rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.18)', padding: '0.35rem 0.7rem', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff' }}>
                    {promo.badge}
                  </span>
                  <h3 style={{ margin: 0, fontFamily: "'Noto Serif',serif", fontSize: '1.8rem', fontWeight: 400, lineHeight: 1.1, color: '#fff' }}>
                    {promo.title[lang]}
                  </h3>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <p style={{ margin: '0 0 1rem', fontSize: '14px', lineHeight: 1.75, color: theme.textSecondary }}>
                  {promo.summary[lang]}
                </p>
                <p style={{ margin: '0 0 1.25rem', fontSize: '14px', lineHeight: 1.8, color: theme.textMuted }}>
                  {promo.details[lang]}
                </p>

                <div style={{ borderRadius: '1rem', border: `1px solid ${theme.borderFaint}`, background: theme.bgInput, padding: '1rem' }}>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700, color: theme.goldBright }}>
                    {t.offerTerms}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {promo.terms[lang].map((term) => (
                      <div key={term} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{ color: theme.goldBright, lineHeight: 1.5 }}>•</span>
                        <span style={{ fontSize: '13px', lineHeight: 1.65, color: theme.textMuted }}>{term}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem calc(env(safe-area-inset-bottom) + 1rem)', borderTop: `1px solid ${theme.borderFaint}`, background: theme.bgSurface }}>
                <button
                  type="button"
                  onClick={handlePromoInquiry}
                  style={{ width: '100%', height: '3.5rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(135deg,#7a5c10,#9a7416)', color: '#fff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer' }}
                >
                  {promo.cta[lang]}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
