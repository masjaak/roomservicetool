# Demo Presentation Checklist

Use this as the live presentation sequence when showing the app to hotel prospects.

## Before the Meeting

1. Confirm the web app and iOS shell both open correctly
2. Confirm Firebase project points to the demo environment, not local experiments
3. Seed the demo stay records
4. Prepare one fresh QR access token or `?access=` URL for the valid stay
5. Turn the generated URL into a QR code and print or save it in a presentation slide
6. Keep one revoked or expired QR example ready for the security segment

## Storyline To Present

### 1. Guest Access Is Not Open to the Public

- Show the app without a QR token
- Explain that access is denied without a valid hotel-issued entry token
- State that the QR is tied to an active stay, not just a public landing link

### 2. Guest Identity Is Cross-Checked

- Scan or open the valid QR
- Show the login requiring:
  - room number
  - guest last name
  - phone number
- Explain that the app cross-checks those fields against the active stay record

### 3. Security Against Ghost Orders

- Try one invalid login example
- Explain that stale stays, mismatched phone numbers, and expired tokens are rejected
- Explain that order creation happens on the backend, not directly from the client
- Explain that rate limiting blocks repeated rapid submissions

### 4. Guest Ordering Experience

- Log in with the valid in-house guest
- Browse menu
- Add items
- Checkout and place order
- Show the live order status

### 5. Order Visibility

- Open the Firebase Console or your separate operations tool
- Show the incoming order detail in `orders`
- Show that guest phone number is collected for service follow-up
- Show that each order remains tied to room/stay information

## Demo Records Included In This Repo

Use these seeded examples:

- Valid stay:
  - room `1204`
  - last name `Santoso`
  - phone `6281234567890`
- Invalid stale stay:
  - room `807`
  - last name `Pratama`
  - phone `6281111111111`

## What To Emphasize To Hotel Prospects

- This is not just a digital menu; it is a controlled guest-access ordering channel
- Guest identity is checked against the hotel stay record before ordering is allowed
- Orders are auditable and can feed operations analytics and guest service follow-up
- The same access pattern can later expand to spa, concierge, housekeeping, and upsell modules
