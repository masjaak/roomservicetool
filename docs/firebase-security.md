# Firebase Security Plan

This document defines the production-grade Firebase structure for the guest app so it can be presented to hotels as a controlled room-service system, not a public order form.

## Security Goal

The guest app must only be usable by active in-house guests. A random visitor who gets the URL should not be able to browse the menu and place an order.

## Current Live Mode On Spark

The live project `hcsroomserviceapp` is currently running in a Spark-compatible demo mode because Cloud Functions are not available on the free plan.

What is live now:

- QR access tokens are stored directly in Firestore
- guest login is verified client-side against:
  - `guest_access_tokens`
  - `guest_stays`
- order creation writes directly to Firestore
- Firestore rules still require:
  - valid active token
  - active matching stay
  - matching room, last name, and phone
- session revoke is simulated by revoking the access token
- rate limiting is enforced in the client for demo purposes

Important:

- this is suitable for demos and pre-sales presentations
- this is not the final production security model
- the production model remains the backend-callable flow documented below

## Recommended Production Access Model

Use a QR-first access flow:

1. Hotel PMS or staff creates an active `guest_stays` record.
2. Backend creates a one-time `guest_access_tokens` document for that stay.
3. The printed QR code contains only the token redemption URL, not a permanent open guest URL.
4. Guest opens the QR link and completes verification with:
   - room number
   - last name
   - phone number
5. A backend redemption step validates:
   - token is valid
   - token is not expired
   - token is not already redeemed
   - stay is active / checked in
   - guest details match the stay record
6. Backend signs the guest into Firebase Auth with a guest role and creates `guest_access_sessions/{uid}`.
7. Firestore rules allow order creation only when an active session exists and the order matches that session.

Without this backend redemption step, a shared link can still be abused.

## Collections

### `admin_users/{uid}`

Used to identify hotel/admin operators.

Suggested fields:

- `hotelId`
- `email`
- `name`
- `role` = `admin`
- `active`
- `createdAt`

### `guest_stays/{stayId}`

Source of truth for who is currently allowed to access room service.

Suggested fields:

- `hotelId`
- `reservationId`
- `roomNumber`
- `lastName`
- `lastNameNormalized`
- `phoneNumber`
- `phoneNumberNormalized`
- `status` = `booked | checked_in | checked_out | cancelled`
- `checkedIn`
- `checkedInAt`
- `expectedCheckoutAt`
- `guestCount`
- `language`
- `createdAt`
- `updatedAt`

### `guest_access_tokens/{tokenId}`

One QR token per stay or per device flow.

Suggested fields:

- `hotelId`
- `stayId`
- `roomNumber`
- `tokenHash`
- `status` = `active | redeemed | expired | revoked`
- `expiresAt`
- `redeemedAt`
- `redeemedByUid`
- `createdAt`
- `createdBy`

Important:

- Store `tokenHash`, not the raw token, in Firestore.
- Raw token should be validated only in backend code.

### `guest_access_sessions/{uid}`

Short-lived guest session created only after token redemption and guest verification.

Suggested fields:

- `hotelId`
- `stayId`
- `roomNumber`
- `lastName`
- `phoneNumber`
- `role` = `guest`
- `status` = `active | revoked | expired`
- `source` = `qr`
- `expiresAt`
- `createdAt`
- `lastSeenAt`

### `guest_access_logins/{loginId}`

Audit trail for guest verification and access.

Suggested fields:

- `hotelId`
- `stayId`
- `guestUid`
- `roomNumber`
- `lastName`
- `phoneNumber`
- `source` = `guest_app`
- `createdAt`

### `orders/{orderId}`

Guest orders. Each order must be traceable to one verified guest session.

Suggested fields:

- `hotelId`
- `stayId`
- `guestUid`
- `roomNumber`
- `lastName`
- `phoneNumber`
- `items`
- `subtotal`
- `tax`
- `total`
- `paymentMethod`
- `status`
- `createdAt`
- `updatedAt`
- `isRead`
- feedback fields after delivery

## Firestore Rules Strategy

The rules in `firestore.rules` implement this model:

- only admins can manage `guest_stays`, `guest_access_tokens`, and sessions
- guests can create orders only if they have an active guest session
- the order payload must match the active session
- guests can read only their own orders
- guests can only update feedback fields after delivery/completion
- deletes are disabled

## What Still Needs Backend Work

This repo now includes backend scaffolding for:

1. QR token redemption via callable function
2. Firebase Auth custom guest claims
3. App Check wiring
4. Backend order creation with rate limiting
5. Guest session revocation

Files:

- `functions/src/index.ts`
- `src/lib/guestSession.ts`
- `src/lib/appCheck.ts`

What still needs deployment/configuration:

- Firebase Functions deployment
- App Check site key provisioning
- front desk/admin tooling for generating QR tokens
- Firebase Auth custom-token flow enabled in the target project

Recommended backend additions:

1. Admin UI for issuing guest QR tokens per room/stay
2. PMS integration or nightly import into `guest_stays`
3. Session expiry cleanup job
4. Front desk revoke controls

## Presentation-Safe Security Story

If you are presenting this to hotels, the clean story is:

- access is initiated by hotel-issued QR only
- QR tokens are short-lived and revocable
- guest identity is matched against live stay data
- only verified in-house guests can create orders
- every login and order is auditable
- room, guest name, and phone are retained for operations follow-up

## Additional Improvements Worth Building

### 1. App Check

Enable Firebase App Check for Firestore and callable backend endpoints so non-authentic clients are rejected before they can abuse the backend.

### 2. Rate Limiting

Add backend rate limits per guest session:

- login attempts per token
- orders per 5 minutes
- feedback submissions per order

### 3. Session Revocation

Front desk should be able to revoke a guest session when:

- guest checks out
- room changes
- suspicious activity is detected

### 4. One Active Session Per Stay

If desired, only allow one active mobile session per stay to reduce link sharing.

### 5. Hotel Branding / Multi-Tenant Readiness

Add `hotelId` to every operational collection from day one. This makes the product much easier to position as a reusable lead-generation demo for multiple hotels.
