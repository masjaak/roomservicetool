# Atelier Meridian · Room Service

A premium, bilingual (EN / ID) web application designed for luxury hotel in-room dining. This service blends digital simplicity with high-end customer experience, providing a responsive and fluid journey from menu browsing to live order tracking.

## Core Features
- **Dynamic Bilingual Support:** Seamlessly toggle between English and Indonesian across all interactions and product descriptions.
- **Robust State Machine:** Application flow (Login → Menu → Checkout → Tracking) is strictly governed by a pure reducer, guarding against invalid transitions and minimizing undefined UI states.
- **WhatsApp Integration:** Fallback-safe WhatsApp dynamic linking to seamlessly connect guests with the kitchen staff upon order confirmation.
- **Live Order Tracking:** Integrated with Firebase (Firestore) to listen to real-time status updates reflecting kitchen and delivery progress.
- **Premium UI / Responsive Design:** Clean, editorial design localized for both mobile scrolling and structured desktop layouts using dynamic Tailwind constraints. No unnecessary gradients or artificial layouts.

## Tech Stack
- **Framework:** React 18 / Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion
- **Backend/Database:** Firebase (Firestore)
- **Testing:** Vitest

## Getting Started

### Prerequisites
Make sure you have Node.js and a package manager installed (`npm` or `yarn` / `bun`).

### Installation
Clone the repository, then install bindings:
```bash
npm install
```

### Environmental Config
For Firebase functionality, ensure your configuration details (e.g., inside `src/lib/firebase.ts`) match your target project settings before deployment. 

### Running Locally
To run the development server locally:
```bash
npm run dev
```

### Running Tests
The project features an extensive suite of integration and unit tests validating explicit State Machine guards and UI rendering conditions.
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

## Architectural Highlights
- **State Integrity (`src/machine/`):** View context, Cart operations, and specific form validations are pure implementations. Handlers explicitly fire immutable payload actions (`SubmitOrder`, `ResetFlow`) rather than mutating UI states loosely.
- **Decoupled Side-Effects:** Firebase synchronization and WhatsApp integrations execute explicitly via `App.tsx` outside of the state reducer natively to capture explicit `OrderSubmitSucceeded` vs `OrderSubmitFailed` paths, ensuring graceful error handling. 
- **Offline & Connectivity Support:** If network conditions fail Firebase handovers, time-out bounds specifically notify the guest. Fallback GUI structures gracefully bridge blocked `window.open` intents to ensure users always establish contact.