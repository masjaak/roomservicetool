const FIREBASE_PREFIXES = [
  '/firebase/',
  '/@firebase/',
];

const FRAMER_MOTION_PREFIXES = [
  '/framer-motion/',
  '/motion/',
];

export function resolveVendorChunk(id: string): string | undefined {
  if (!id.includes('/node_modules/')) {
    return undefined;
  }

  if (FIREBASE_PREFIXES.some((prefix) => id.includes(prefix))) {
    return 'firebase';
  }

  if (FRAMER_MOTION_PREFIXES.some((prefix) => id.includes(prefix))) {
    return 'motion';
  }

  return undefined;
}
