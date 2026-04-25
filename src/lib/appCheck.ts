import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './firebase';

let initialized = false;

export function initializeGuestAppCheck(): void {
  const siteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY;

  if (!siteKey || initialized || !app) {
    return;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  initialized = true;
}
