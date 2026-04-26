# Deployment Checklist

This checklist is for turning the demo repository into a deployable hotel-facing build with Firebase security turned on.

## Spark Demo Mode

If you stay on the free Firebase plan:

- set `VITE_FIREBASE_SPARK_DEMO_MODE=true`
- deploy only:
  - hosting
  - firestore rules
  - firestore indexes
- use Firestore-backed QR tokens instead of Cloud Functions
- understand that rate limiting and revoke behavior are demo-grade, not production-grade

If you later move to Blaze:

- turn `VITE_FIREBASE_SPARK_DEMO_MODE` off
- deploy Functions
- switch back to the backend-secured callable flow

## 1. Prepare Firebase Project

- Create or choose the target Firebase project
- Enable:
  - Firestore
  - Authentication
  - Functions
  - App Check
- Decide the production region
  - default in this repo: `asia-southeast2`

## 2. Configure Web Environment

Create `.env.local` or deployment secrets using:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_FUNCTIONS_REGION`
- `VITE_FIREBASE_APP_CHECK_SITE_KEY`

## 3. Seed Core Firestore Data

Create at least:

- one `guest_stays` document

Optional for demo:

- seed one active room/stay for QR token generation

## 4. Install and Build Functions

```bash
cd functions
npm install
npm run build
```

## 5. Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## 6. Deploy Functions

```bash
firebase deploy --only functions
```

Verify deployed callables:

- `redeemGuestAccess`
- `createGuestOrder`
- `revokeGuestSession`

## 7. Enable App Check

Recommended for web:

- reCAPTCHA v3 provider

Required tasks:

- create site key in Firebase App Check
- add the site key into `VITE_FIREBASE_APP_CHECK_SITE_KEY`
- enforce App Check after confirming client tokens are flowing

Do not enforce App Check before the frontend is configured, or guest login/order requests will fail.

## 8. Build and Deploy Web App

```bash
npm install
npm run build
```

If using Firebase Hosting:

```bash
firebase deploy --only hosting
```

If using Vercel or another host:

- add the same environment variables there
- confirm the build command is `npm run build`
- confirm output directory is `build`

## 9. Generate Demo QR Access

After your operations tooling is ready:

- generate a token for an active stay
- copy the generated URL into a QR generator
- test redemption from a clean browser/device session

## 10. Verify Security End-to-End

Run this exact sequence:

1. Open guest app without `?access=` token
   - expected: login denied
2. Open guest app with expired or invalid token
   - expected: login denied
3. Open guest app with valid token but wrong guest details
   - expected: login denied
4. Open guest app with valid token and matching active stay
   - expected: login allowed
5. Place several rapid orders from one session
   - expected: backend rate limiting eventually blocks requests
6. Revoke the guest session from your operations tooling
   - expected: guest order access fails afterward

## 11. iOS Shell Sync

If iOS Simulator / Xcode build is used:

```bash
npm run build
npx cap sync ios
```

Then rebuild from Xcode or simulator CLI.

## Release Gate

Do not treat deployment as complete unless all of the following are true:

- web build succeeds
- functions build succeeds
- Firestore rules deployed
- indexes deployed
- App Check configured
- guest QR redemption tested
- guest order creation tested
- revoke flow tested
