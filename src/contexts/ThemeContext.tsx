import React, { createContext, useContext, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface ThemeTokens {
  mode: ThemeMode;
  bgBase: string;
  bgSurface: string;
  bgMuted: string;
  bgInput: string;
  bgHeader: string;
  bgNav: string;
  textBase: string;
  textMuted: string;
  textSecondary: string;
  gold: string;
  goldBright: string;
  border: string;
  borderFaint: string;
  errorBg: string;
  errorText: string;
  divider: string;
}

const dark: ThemeTokens = {
  mode: 'dark',
  bgBase: '#0d0c0b',
  bgSurface: '#1a1714',
  bgMuted: '#221e1a',
  bgInput: 'rgba(255,255,255,0.07)',
  bgHeader: 'rgba(13,12,11,0.9)',
  bgNav: 'rgba(13,12,11,0.97)',
  textBase: '#ffffff',
  textMuted: 'rgba(255,255,255,0.52)',
  textSecondary: 'rgba(255,255,255,0.72)',
  gold: '#9a7416',
  goldBright: '#c9951a',
  border: 'rgba(255,255,255,0.1)',
  borderFaint: 'rgba(255,255,255,0.06)',
  errorBg: 'rgba(255,80,60,0.12)',
  errorText: '#ff8070',
  divider: 'rgba(255,255,255,0.07)',
};

const light: ThemeTokens = {
  mode: 'light',
  bgBase: '#faf9f7',
  bgSurface: '#f0ede8',
  bgMuted: '#e5e0d8',
  bgInput: 'rgba(26,23,20,0.06)',
  bgHeader: 'rgba(250,249,247,0.92)',
  bgNav: 'rgba(250,249,247,0.97)',
  textBase: '#1a1714',
  textMuted: 'rgba(26,23,20,0.5)',
  textSecondary: 'rgba(26,23,20,0.7)',
  gold: '#9a7416',
  goldBright: '#7a5c10',
  border: 'rgba(26,23,20,0.12)',
  borderFaint: 'rgba(26,23,20,0.06)',
  errorBg: 'rgba(180,30,20,0.08)',
  errorText: '#b91c1c',
  divider: 'rgba(26,23,20,0.08)',
};

interface ThemeContextValue {
  theme: ThemeTokens;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: dark,
  toggle: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const theme = mode === 'dark' ? dark : light;
  const toggle = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
