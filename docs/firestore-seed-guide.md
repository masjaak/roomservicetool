# Firestore Seed Guide

Use this guide to create the minimum data needed for a strong hotel demo.

Reference files:

- `docs/firestore-seed-example.json`
- `docs/firestore-demo-seed.json`

## Collections To Seed First

### `admin_users`

Purpose:

- identifies who can use admin functions and QR issuance

Required minimum:

- `hotelId`
- `email`
- `name`
- `role = admin`
- `active = true`

### `guest_stays`

Purpose:

- source of truth for who is actively checked in and allowed to access room service

Required minimum:

- `hotelId`
- `roomNumber`
- `lastName`
- `lastNameNormalized`
- `phoneNumber`
- `phoneNumberNormalized`
- `status = checked_in`
- `checkedIn = true`

## Demo Flow Recommendation

Seed at least these scenarios:

1. valid active stay
2. checked-out stay
3. wrong-phone stay

That gives you a convincing presentation story:

- valid guest can access
- invalid or stale guest cannot access

## Suggested Demo Records

### Valid in-house guest

- room `1204`
- last name `Santoso`
- phone `6281234567890`
- status `checked_in`

### Invalid stale guest

- room `807`
- status `checked_out`

### Invalid wrong details case

- same room but different phone

## Note About Timestamps

When inserting manually from Firebase Console:

- use Firestore timestamp values for operational fields like:
  - `checkedInAt`
  - `expectedCheckoutAt`
  - `createdAt`
  - `updatedAt`

For a quick demo, the boolean/status fields are enough to make the access gate work.

## Recommended Demo Import Path

For a stronger demo, use the richer dataset in `docs/firestore-demo-seed.json` and seed it with:

```bash
cd functions
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json \
FIREBASE_PROJECT_ID=<your-project-id> \
node scripts/seed-demo-data.mjs
```

That seed file includes:

- two admin users
- one valid in-house guest
- one checked-out guest
- one wrong-details example
