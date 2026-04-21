import React from 'react';
import { Screen } from '../machine/types';
import { guestTheme } from '../styles/guestTheme';
import type { Language } from '../types';

const LOADING_COPY = {
  EN: {
    [Screen.Welcome]: {
      title: 'Opening guest access',
      body: 'Preparing your mobile check-in screen.',
    },
    [Screen.Menu]: {
      title: 'Preparing your dining menu',
      body: 'Optimizing the mobile experience for your stay.',
    },
    [Screen.Checkout]: {
      title: 'Preparing checkout',
      body: 'Please wait while we load a secure mobile payment screen.',
    },
    [Screen.Confirmed]: {
      title: 'Preparing order tracking',
      body: 'Loading your live delivery status.',
    },
  },
  ID: {
    [Screen.Welcome]: {
      title: 'Membuka akses tamu',
      body: 'Sedang menyiapkan layar check-in mobile Anda.',
    },
    [Screen.Menu]: {
      title: 'Menyiapkan menu kamar',
      body: 'Mengoptimalkan pengalaman mobile untuk masa inap Anda.',
    },
    [Screen.Checkout]: {
      title: 'Menyiapkan pembayaran',
      body: 'Mohon tunggu, kami sedang memuat layar mobile dengan aman.',
    },
    [Screen.Confirmed]: {
      title: 'Menyiapkan pelacakan pesanan',
      body: 'Sedang memuat status pengantaran Anda.',
    },
  },
} as const;

interface ScreenLoadingStateProps {
  screen: Screen;
  lang: Language;
}

export const ScreenLoadingState: React.FC<ScreenLoadingStateProps> = ({ screen, lang }) => {
  const copy = LOADING_COPY[lang][screen];

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center px-8 text-center ${guestTheme.bg.canvas}`}>
      <div className={`mb-6 h-16 w-16 rounded-full ${guestTheme.bg.surfaceSoft} shadow-[0_10px_30px_rgba(26,28,27,0.05)]`} />
      <div className="space-y-3">
        <h2 className={`font-headline text-2xl ${guestTheme.text.base}`}>{copy.title}</h2>
        <p className={`max-w-xs text-sm leading-relaxed ${guestTheme.text.muted}`}>{copy.body}</p>
      </div>
      <div
        aria-hidden="true"
        className={`mt-8 h-1.5 w-32 overflow-hidden rounded-full ${guestTheme.bg.surfaceMuted}`}
      >
        <div className={`h-full w-1/2 rounded-full ${guestTheme.bg.primary} animate-pulse`} />
      </div>
      <p className={`sr-only`} aria-live="polite">
        {copy.title}
      </p>
    </div>
  );
};
