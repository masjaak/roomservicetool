export const guestTheme = {
  bg: {
    canvas: 'bg-[var(--hcs-background)]',
    surface: 'bg-[var(--hcs-surface)]',
    surfaceSoft: 'bg-[var(--hcs-surface-soft)]',
    surfaceMuted: 'bg-[var(--hcs-surface-muted)]',
    inverse: 'bg-[var(--hcs-inverse)]',
    primary: 'bg-[var(--hcs-primary)]',
    primarySoft: 'bg-[var(--hcs-primary-soft)]',
    errorSoft: 'bg-[var(--hcs-error-soft)]',
    overlay: 'bg-[color:rgba(26,28,27,0.35)]',
  },
  text: {
    base: 'text-[var(--hcs-text)]',
    muted: 'text-[var(--hcs-text-muted)]',
    label: 'text-[var(--hcs-outline)]',
    primary: 'text-[var(--hcs-primary)]',
    inverse: 'text-[var(--hcs-inverse-text)]',
    onPrimary: 'text-white',
    error: 'text-[var(--hcs-error)]',
  },
  border: {
    base: 'border-[var(--hcs-line)]',
    strong: 'border-[var(--hcs-line-strong)]',
    error: 'border-[var(--hcs-error)]',
  },
  ring: {
    primary: 'ring-[var(--hcs-primary)]/20',
  },
} as const;
