import { readFileSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const args = {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    file: path.join(repoRoot, 'docs', 'firestore-demo-seed.json'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === '--project' && argv[index + 1]) {
      args.projectId = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === '--file' && argv[index + 1]) {
      args.file = path.resolve(argv[index + 1]);
      index += 1;
    }
  }

  return args;
}

function resolveFirestoreValue(value) {
  if (Array.isArray(value)) {
    return value.map(resolveFirestoreValue);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (value.__type === 'serverTimestamp') {
    return FieldValue.serverTimestamp();
  }

  if (value.__type === 'timestamp') {
    const parsed = new Date(value.value);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid timestamp value: ${value.value}`);
    }

    return Timestamp.fromDate(parsed);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, resolveFirestoreValue(nestedValue)]),
  );
}

async function loadSeedFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function ensureFirebaseApp(projectId) {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsPath) {
    return initializeApp({
      credential: cert(JSON.parse(readFileSync(credentialsPath, 'utf8'))),
      projectId: projectId || undefined,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: projectId || undefined,
  });
}

async function main() {
  const { projectId, file } = parseArgs(process.argv.slice(2));
  ensureFirebaseApp(projectId);
  const db = getFirestore();
  const seed = await loadSeedFile(file);

  const collections = Object.entries(seed);

  for (const [collectionName, documents] of collections) {
    if (!documents || typeof documents !== 'object' || Array.isArray(documents)) {
      throw new Error(`Collection ${collectionName} must be an object keyed by document ID.`);
    }

    for (const [docId, payload] of Object.entries(documents)) {
      await db.collection(collectionName).doc(docId).set(resolveFirestoreValue(payload), { merge: true });
      console.log(`Seeded ${collectionName}/${docId}`);
    }
  }

  console.log('Firestore demo seed completed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
