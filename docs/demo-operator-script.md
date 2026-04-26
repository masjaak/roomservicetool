# Demo Operator Script

Use this when you want a repeatable live demo without improvising the flow.

## Pre-Demo Setup

1. Start the guest app build or dev server
2. Confirm the Firebase demo project is selected
3. Confirm demo data has been seeded
4. Prepare one fresh guest QR token for the valid stay:
   - hotel ID: `atelier-meridian-demo`
   - stay ID: `stay-1204-demo`
   - room number: `1204`
5. Copy the generated URL and convert it to a QR code
6. Keep one browser tab with the guest app and one tab with Firebase Console or your separate operations tool

## Successful Guest Journey

1. Open the QR URL on a fresh browser session or simulator
2. Show that the guest must still enter:
   - room number `1204`
   - last name `Santoso`
   - phone number `6281234567890`
3. Submit login
4. Explain that the QR alone is not enough because guest identity is still cross-checked with the active stay record
5. Browse menu
6. Add 1 or 2 items to the cart
7. Proceed to checkout
8. Place the order
9. Show the tracking screen
10. Switch to Firebase Console or your separate operations tool and show the same order appear there

## Security Rejection Scenarios

### Invalid Access Without QR

1. Open the guest app root URL without `?access=`
2. Show that login cannot proceed

### Wrong Guest Details

1. Open the valid QR URL again in a clean session
2. Enter:
   - room number `1204`
   - last name `Santoso`
   - phone number `6289999999999`
3. Show that access is rejected

### Checked-Out Guest

1. Open a valid or regenerated QR flow
2. Try:
   - room number `807`
   - last name `Pratama`
   - phone number `6281111111111`
3. Show that checked-out guests are rejected

## Session Safety Control

1. Open the matching `guest_access_sessions/{uid}` record
2. Mark the session/token revoked using your backend or separate operations tool
3. Return to the guest side
4. Attempt another order action
5. Explain that access can still be cut immediately when needed

## What To Say During The Demo

- Access is issued by the hotel through a QR token, not by a public guest link
- The QR token is redeemed once and then removed from the visible URL
- The guest must still match the active stay record using room number, last name, and phone number
- Order creation happens through backend callables with rate limiting and session checks
- QR access lifecycle can be handled outside the guest app repo by hotel operations tooling
