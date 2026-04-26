# Firebase Deploy Runbook

Use this runbook when you are preparing the hotel demo or production-like presentation environment.

## 1. Select the Firebase Project

```bash
firebase login
firebase use <your-project-id>
firebase projects:list
```

Confirm the project you selected matches the environment values in `.env.local` or your hosting platform variables.

## 2. Prepare Environment Variables

Guest web app variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_FUNCTIONS_REGION`
- `VITE_FIREBASE_APP_CHECK_SITE_KEY`

Recommended local setup:

```bash
cp .env.example .env.local
```

Then fill every variable with the target Firebase project values.

## 3. Build and Seed Functions

```bash
cd functions
npm install
npm run build
```

If you want to seed demo data from this repo:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json \
FIREBASE_PROJECT_ID=<your-project-id> \
node scripts/seed-demo-data.mjs
```

Optional custom seed file:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json \
FIREBASE_PROJECT_ID=<your-project-id> \
node scripts/seed-demo-data.mjs --file ../docs/firestore-demo-seed.json
```

## 4. Deploy Firestore Controls

Run from repo root:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Do not continue before both deploys succeed.

## 5. Deploy Functions

Run from repo root:

```bash
firebase deploy --only functions
```

Expected callable functions after deploy:

- `redeemGuestAccess`
- `createGuestOrder`
- `revokeGuestSession`

## 6. Configure App Check

Recommended flow:

1. Open Firebase Console
2. Register the web app under App Check
3. Choose reCAPTCHA v3 for the web frontend
4. Copy the site key into `VITE_FIREBASE_APP_CHECK_SITE_KEY`
5. Redeploy the frontend
6. After validation, enforce App Check in Firebase Console

Do not enforce App Check before the client site key is wired, or guest access and ordering will fail.

## 7. Build and Deploy the Guest App

```bash
npm install
npm run build
```

If using Firebase Hosting:

```bash
firebase deploy --only hosting
```

If using another host:

- build command: `npm run build`
- output directory: `build`
- copy the same `VITE_*` variables into that host

## 8. Sync iOS Shell

After the web build is correct:

```bash
npm run build
npx cap sync ios
```

Then run the iOS app again from Xcode or the simulator target you already configured.

## 9. Post-Deploy Smoke Test

Check these in order:

1. Guest app without `?access=` is rejected
2. Invalid or expired QR token is rejected
3. Valid token plus wrong room/last name/phone is rejected
4. Valid token plus matching active stay is accepted
5. Order creation works only from the verified guest session
6. Repeated rapid orders hit the backend limiter
7. Revoking a guest session from your separate operations tool removes guest ordering access
