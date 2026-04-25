import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAkd7RklJ7B8ol4y2KFLFG-AXLVRW0GmuiRe-f2PVr_OsOU7bli6263fxf1QuvywDKHLYtg5aiUMiIw0KBiRJNKK4cYa8a1mO2MOowmwxTRxYjIES1kCts-Ol6OI6GXr8S1dDxNmL0Vt80Yo-9t6FgE5xWtNg7bYSRQj7U_E2qyiwUW-NK9pOY6QUzapco6F0x2scioqJuSjkUjHInSIeww_wvR0GA8rOFc3RAY21FhDU-UPwzN1ZIklThbrKkcZn9KOqeq051ciw';

const DURATION_MS = 2800;

interface SplashScreenProps {
  onDone: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / DURATION_MS, 1);
      setProgress(pct);

      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setVisible(false);
          setTimeout(onDone, 600);
        }, 200);
      }
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${HERO_IMAGE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Dark overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.55) 100%)',
            }}
          />

          {/* Center content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            {/* Monogram badge */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(210,188,148,0.22)',
                border: '1.5px solid rgba(210,188,148,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
                backdropFilter: 'blur(4px)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Noto Serif', serif",
                  fontSize: 26,
                  fontWeight: 400,
                  color: '#e8d9b8',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}
              >
                AM
              </span>
            </div>

            {/* Hotel name */}
            <h1
              style={{
                margin: 0,
                fontFamily: "'Noto Serif', serif",
                fontSize: 28,
                fontWeight: 400,
                color: '#ffffff',
                letterSpacing: '0.02em',
                textAlign: 'center',
              }}
            >
              Atelier Meridian
            </h1>

            {/* Tagline */}
            <p
              style={{
                margin: 0,
                fontFamily: "'Manrope', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.65)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              In-Room Dining&nbsp;&nbsp;|&nbsp;&nbsp;Experience
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: '0 40px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'Manrope', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Preparing your experience
            </p>
            <div
              style={{
                width: '100%',
                maxWidth: 220,
                height: 1.5,
                background: 'rgba(255,255,255,0.18)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  background: 'linear-gradient(to right, rgba(210,188,148,0.7), #d2bc94)',
                  borderRadius: 2,
                  transition: 'width 0.05s linear',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
