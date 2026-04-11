import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const FORBIDDEN = [
  'ciputra',
  'hcsroomservice',
  'gallery restaurant',
  'logo-ciputra',
  'ciputra_cart',
  'nasi goreng ciputra',
  'ciputra club sandwich',
];

// Firebase config values are backend identifiers — excluded from the scan.
const FIREBASE_EXCEPTIONS = [
  'hcsroomserviceapp.firebaseapp.com',
  'hcsroomserviceapp',
  'hcsroomserviceapp.firebasestorage.app',
];

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      collectSourceFiles(full, files);
    } else if (/\.(ts|tsx|html|css|json|md)$/.test(entry.name)) {
      // Skip package-lock.json, compiled CSS, and test files (they reference forbidden strings as negative assertions)
      if (entry.name === 'package-lock.json') continue;
      if (entry.name === 'index.css') continue; // Compiled Tailwind output
      if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) continue;
      files.push(full);
    }
  }
  return files;
}

describe('brand guard — forbidden strings', () => {
  const root = path.resolve(__dirname, '../..');
  const files = collectSourceFiles(root);

  it('found source files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const forbidden of FORBIDDEN) {
    it(`no source file contains "${forbidden}"`, () => {
      const violations: string[] = [];

      for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
        // Remove firebase exception lines before checking
        let cleaned = content;
        for (const exception of FIREBASE_EXCEPTIONS) {
          cleaned = cleaned.replaceAll(exception.toLowerCase(), '');
        }

        if (cleaned.includes(forbidden)) {
          const rel = path.relative(root, filePath);
          violations.push(rel);
        }
      }

      expect(
        violations,
        `Found "${forbidden}" in: ${violations.join(', ')}`,
      ).toEqual([]);
    });
  }
});
