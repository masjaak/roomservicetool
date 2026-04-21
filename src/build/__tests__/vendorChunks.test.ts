import { describe, expect, it } from 'vitest';
import { resolveVendorChunk } from '../vendorChunks';

describe('resolveVendorChunk', () => {
  it('splits firebase packages into a dedicated vendor chunk', () => {
    expect(resolveVendorChunk('/workspace/node_modules/firebase/firestore/dist/index.mjs')).toBe('firebase');
    expect(resolveVendorChunk('/workspace/node_modules/@firebase/app/dist/index.cjs.js')).toBe('firebase');
  });

  it('splits framer-motion packages into a dedicated motion chunk', () => {
    expect(resolveVendorChunk('/workspace/node_modules/framer-motion/dist/es/index.mjs')).toBe('motion');
    expect(resolveVendorChunk('/workspace/node_modules/motion/react/dist/index.mjs')).toBe('motion');
  });

  it('leaves application modules and unrelated vendors untouched', () => {
    expect(resolveVendorChunk('/workspace/src/App.tsx')).toBeUndefined();
    expect(resolveVendorChunk('/workspace/node_modules/lucide-react/dist/index.mjs')).toBeUndefined();
  });
});
