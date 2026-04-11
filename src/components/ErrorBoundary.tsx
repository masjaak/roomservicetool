import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/constants';

interface Props {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }

    return this.props.children;
  }
}

export const TrackingFallback = ({ onReset, lang }: { onReset: () => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-screen" style={{ backgroundColor: '#faf8f5' }}>
      <AlertTriangle className="w-12 h-12 mb-4" style={{ color: '#b43c3c' }} />
      <h2 className="text-xl font-bold mb-2" style={{ color: '#2d2d2d' }}>
        {lang === 'ID' ? 'Terjadi Kesalahan' : 'Something went wrong'}
      </h2>
      <p className="text-sm mb-6" style={{ color: '#555' }}>
        {lang === 'ID' ? 'Kami tidak dapat memuat status pesanan Anda. Pesanan Anda tetap diproses.' : 'We could not load your order tracking. Your order is still being processed.'}
      </p>
      <button
        onClick={onReset}
        className="px-6 py-3 rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-md active:scale-[0.98]"
        style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}
      >
        {lang === 'ID' ? 'Kembali' : 'Go Back'}
      </button>
    </div>
  );
};

export const GuestFallback = ({ onReset, lang }: { onReset: () => void, lang: Language }) => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-screen" style={{ backgroundColor: '#faf8f5', fontFamily: "'Inter', sans-serif" }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(180,60,60,0.1)' }}>
        <AlertTriangle className="w-8 h-8" style={{ color: '#b43c3c' }} />
      </div>
      <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
        {lang === 'ID' ? 'Layanan Terganggu' : 'Experience Interrupted'}
      </h2>
      <p className="text-sm mb-8 leading-relaxed max-w-sm" style={{ color: '#888' }}>
        {lang === 'ID' 
          ? 'Mohon maaf, halaman yang Anda tuju mengalami kendala teknis. Kami sedang memperbaikinya.' 
          : 'We encountered a technical issue displaying this screen. Our team has been notified.'}
      </p>
      <button
        onClick={onReset}
        className="px-8 py-3.5 rounded-full font-bold text-[10px] tracking-widest uppercase transition-all active:scale-[0.98]"
        style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}
      >
        {lang === 'ID' ? 'Kembali ke Beranda' : 'Return to Home'}
      </button>
    </div>
  );
};
