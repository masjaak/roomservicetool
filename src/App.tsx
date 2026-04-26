import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { reducer } from './machine/reducer';
import { createInitialState, Screen, AppEvent } from './machine/types';
import { persistCart, loadCart, buildWhatsAppUrl, clearCart } from './machine/effects';
import type { CartEntry, PaymentMethod } from './machine/types';
import type { Language, MenuItem } from './types';
import { ErrorBoundary, TrackingFallback, GuestFallback } from './components/ErrorBoundary';
import { SplashScreen } from './components/SplashScreen';
import { openWhatsAppOrder } from './utils/whatsAppNavigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { auth, db, firebaseConfigError, isSparkDemoMode } from './lib/firebase';
import { createGuestOrder, getAccessTokenFromUrl, GuestSession, loadStoredGuestSession, redeemGuestAccessSession, revokeCurrentGuestSession, scrubAccessTokenFromUrl } from './lib/guestSession';
import { normalizeGuestPhone } from './lib/guestAccess';
import { LoginView } from './views/LoginView';
import { MenuView } from './views/MenuView';
import { CheckoutView } from './views/CheckoutView';
import { TrackingView } from './views/TrackingView';

export default function App() {
  const [lang, setLang] = useState<Language>('EN');
  const [state, dispatch] = useReducer(reducer, createInitialState(loadCart()));
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const accessToken = getAccessTokenFromUrl();

  const resetFlow = useCallback((shouldClearCart: boolean) => {
    dispatch({ type: AppEvent.ResetFlow });
    if (shouldClearCart) {
      clearCart();
    }
  }, []);

  // Persist cart to localStorage on changes
  useEffect(() => {
    persistCart(state.cart);
  }, [state.cart]);

  useEffect(() => {
    if (firebaseConfigError) {
      return;
    }

    if (isSparkDemoMode) {
      const session = loadStoredGuestSession();

      if (!session) {
        setGuestSession(null);
        return;
      }

      setGuestSession(session);
      scrubAccessTokenFromUrl();

      if (state.screen === Screen.Welcome && !state.guest.roomNumber) {
        dispatch({
          type: AppEvent.SubmitGuestInfo,
          payload: {
            roomNumber: session.roomNumber,
            lastName: session.lastName,
            phoneNumber: session.phoneNumber,
          },
        });
      }

      return;
    }

    if (!auth || !db) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setGuestSession(null);
        return;
      }

      const sessionSnap = await getDoc(doc(db, 'guest_access_sessions', user.uid));
      if (!sessionSnap.exists()) {
        setGuestSession(null);
        return;
      }

      const sessionData = sessionSnap.data();
      const expiresAt = sessionData.expiresAt?.toDate?.();

      if (sessionData.status !== 'active' || !expiresAt || expiresAt.getTime() <= Date.now()) {
        setGuestSession(null);
        return;
      }

      const session: GuestSession = {
        hotelId: String(sessionData.hotelId || ''),
        stayId: String(sessionData.stayId || ''),
        roomNumber: String(sessionData.roomNumber || ''),
        lastName: String(sessionData.lastName || ''),
        phoneNumber: String(sessionData.phoneNumber || ''),
        expiresAt: expiresAt.toISOString(),
      };

      setGuestSession(session);
      scrubAccessTokenFromUrl();

      if (state.screen === Screen.Welcome && !state.guest.roomNumber) {
        dispatch({
          type: AppEvent.SubmitGuestInfo,
          payload: {
            roomNumber: session.roomNumber,
            lastName: session.lastName,
            phoneNumber: session.phoneNumber,
          },
        });
      }
    });

    return () => unsubscribe();
  }, [state.guest.roomNumber, state.screen]);

  // --- Event dispatchers ---
  const handleLogin = useCallback(async (room: string, phone: string, lastName: string, manualAccessCode?: string) => {
    const resolvedAccessToken = accessToken || manualAccessCode?.trim() || '';

    const roomNumber = room.trim();
    const guestLastName = lastName.trim().replace(/\s+/g, ' ');
    const normalizedPhoneNumber = normalizeGuestPhone(phone);
    let session: GuestSession;

    try {
      session = await redeemGuestAccessSession({
        accessToken: resolvedAccessToken,
        roomNumber,
        lastName: guestLastName,
        phoneNumber: normalizedPhoneNumber,
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : String(err);
      if (code === 'missing-stay' || code === 'guest-mismatch') {
        return lang === 'ID'
          ? 'Data tamu tidak ditemukan. Pastikan nomor kamar, nama belakang, dan nomor HP sudah benar.'
          : 'Guest not found. Please check your room number, last name, and phone number.';
      }
      if (code === 'invalid-token' || code === 'inactive-token') {
        return lang === 'ID'
          ? 'QR kode tidak valid atau sudah kadaluarsa. Silakan scan ulang atau hubungi resepsionis.'
          : 'Your QR code is invalid or has expired. Please scan again or contact the front desk.';
      }
      return lang === 'ID'
        ? 'Detail tamu tidak dapat diverifikasi. Silakan periksa kembali data Anda.'
        : 'We could not verify your guest details. Please review your information and try again.';
    }

    setGuestSession(session);
    scrubAccessTokenFromUrl();

    dispatch({
      type: AppEvent.SubmitGuestInfo,
      payload: {
        roomNumber: session.roomNumber,
        lastName: session.lastName,
        phoneNumber: session.phoneNumber,
      },
    });
    return null;
  }, [accessToken, lang]);

  const addToCart = useCallback((item: MenuItem, qty: number, note: string) => {
    const entry: Omit<CartEntry, 'qty' | 'note'> = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      description: item.description,
      category: item.category,
      tag: item.tag,
      allergens: item.allergens,
    };
    dispatch({ type: AppEvent.AddItem, payload: { item: entry, qty, note } });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    dispatch({ type: AppEvent.RemoveItem, payload: index });
  }, []);

  const handlePlaceOrder = async (method: PaymentMethod, selectedBank: string | null, proof: File | null) => {
    if (!guestSession || (!isSparkDemoMode && !auth.currentUser)) {
      dispatch({
        type: AppEvent.OrderSubmitFailed,
        payload: lang === 'ID'
          ? 'Sesi tamu tidak valid. Silakan masuk kembali dengan detail Anda.'
          : 'Your guest session is no longer valid. Please sign in again with your details.',
      });
      return;
    }

    // Update payment info in state
    dispatch({
      type: AppEvent.SelectPaymentMethod,
      payload: { method, selectedBank, hasProof: method === 'room' || !!proof },
    });

    dispatch({ type: AppEvent.SubmitOrder });

    // Save to Firestore
    const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.21;
    const total = subtotal + tax;

    try {
      const orderResult = await Promise.race([
        createGuestOrder({
          roomNumber: state.guest.roomNumber,
          lastName: state.guest.lastName,
          phoneNumber: state.guest.phoneNumber,
          items: state.cart,
          subtotal,
          tax,
          total,
          paymentMethod: method,
          selectedBank,
          hasPaymentProof: method === 'room' || !!proof,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        )
      ]);
      
      const waUrl = buildWhatsAppUrl(state.cart, state.guest, method);
      let blockedWaUrl: string | null = null;

      try {
        const navigationResult = openWhatsAppOrder({
          url: waUrl,
          viewportWidth: window.innerWidth,
          openNewTab: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
          replaceLocation: (url) => window.location.assign(url),
        });

        blockedWaUrl = navigationResult.blockedUrl;
      } catch {
        blockedWaUrl = waUrl;
      }

      // Dispatch success
      dispatch({ 
        type: AppEvent.OrderSubmitSucceeded, 
        payload: { id: orderResult.orderId, blockedWaUrl: orderResult.blockedWaUrl ?? blockedWaUrl } 
      });

      // Clear persisted cart immediately on success
      clearCart();
    } catch (error: unknown) {
      console.error('Order save error:', error);
      const isTimeout = error instanceof Error && error.message === 'timeout';
      const isRateLimited = error instanceof Error && error.message === 'rate-limit';
      const rawMsg = error instanceof Error ? error.message : String(error);
      const firestoreCode = (error as Record<string, unknown>)?.code as string | undefined;
      const debugInfo = firestoreCode ? `[${firestoreCode}]` : rawMsg ? `[${rawMsg.slice(0, 80)}]` : '';
      dispatch({
        type: AppEvent.OrderSubmitFailed,
        payload: isTimeout
          ? (lang === 'ID' ? 'Koneksi terlalu lama. Silakan coba lagi.' : 'Connection timeout. Please try again.')
          : isRateLimited
            ? (lang === 'ID' ? 'Terlalu banyak percobaan pesanan. Coba lagi beberapa menit lagi.' : 'Too many order attempts. Please wait a few minutes and try again.')
            : `Failed to save order. ${debugInfo}`
      });
    }
  };

  const handleFinishOrder = useCallback(() => {
    dispatch({ type: AppEvent.FinishOrder });
    clearCart();
  }, []);

  const confirmRoomSwitch = useCallback(() => {
    const message = lang === 'ID'
      ? 'Ganti kamar? Pesanan akan dikosongkan.'
      : 'Switch rooms? Your order will be cleared.';

    if (window.confirm(message)) {
      setGuestSession(null);
      void revokeCurrentGuestSession().catch(() => undefined);
      resetFlow(true);
    }
  }, [lang, resetFlow]);

  // --- Render based on state machine screen ---
  return (
    <ThemeProvider>
      {firebaseConfigError ? (
        <div style={{ minHeight: '100dvh', background: '#0d0c0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Manrope', sans-serif" }}>
          <div style={{ maxWidth: '24rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.62)' }}>Configuration Required</p>
            <h1 style={{ margin: '0 0 0.8rem', fontFamily: "'Noto Serif', serif", fontSize: '2rem', fontWeight: 400, lineHeight: 1.05 }}>Firebase setup is incomplete</h1>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.74)' }}>
              {firebaseConfigError}. Add the missing `VITE_FIREBASE_*` variables to this deployment and redeploy the app.
            </p>
          </div>
        </div>
      ) : (
        <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div className="hcs-mobile-shell min-h-screen" style={{ fontFamily: "'Manrope', sans-serif", visibility: showSplash ? 'hidden' : 'visible' }}>
        <AnimatePresence mode="wait">
          {state.screen === Screen.Welcome && (
            <LoginView
              key="login"
              lang={lang}
              setLang={setLang}
              onLogin={handleLogin}
            />
          )}

          {state.screen === Screen.Menu && (
            <ErrorBoundary
              fallback={(_, reset) => (
                <GuestFallback onReset={() => { reset(); resetFlow(true); }} lang={lang} />
              )}
            >
              <MenuView
              key="menu"
              roomNumber={state.guest.roomNumber}
              cart={state.cart}
              addToCart={addToCart}
                removeFromCart={removeFromCart}
                onCheckout={() => dispatch({ type: AppEvent.StartCheckout })}
                onOpenCart={() => dispatch({ type: AppEvent.OpenCart })}
                onCloseCart={() => dispatch({ type: AppEvent.CloseCart })}
                onLogout={confirmRoomSwitch}
                isCartOpen={state.isCartOpen}
                lang={lang}
              />
            </ErrorBoundary>
          )}

          {state.screen === Screen.Checkout && (
            <ErrorBoundary
              fallback={(_, reset) => (
                <GuestFallback onReset={() => { reset(); resetFlow(false); }} lang={lang} />
              )}
            >
              <CheckoutView
                key="checkout"
                cart={state.cart}
                onBack={() => dispatch({ type: AppEvent.BackFromCheckout })}
                onPlaceOrder={handlePlaceOrder}
                loading={state.isProcessing}
                error={state.checkoutError}
                phoneNumber={state.guest.phoneNumber}
                lang={lang}
              />
            </ErrorBoundary>
          )}

          {state.screen === Screen.Confirmed && (
            <ErrorBoundary
              fallback={(_, reset) => (
                <TrackingFallback onReset={() => { reset(); resetFlow(false); }} lang={lang} />
              )}
            >
              <TrackingView
                key="tracking"
                roomNumber={state.guest.roomNumber}
                onFinish={handleFinishOrder}
                lang={lang}
                orderId={state.orderId}
                blockedWaUrl={state.blockedWaUrl}
              />
            </ErrorBoundary>
          )}
        </AnimatePresence>
      </div>
        </>
      )}
    </ThemeProvider>
  );
}
