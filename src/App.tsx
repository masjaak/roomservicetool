import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { reducer } from './machine/reducer';
import { createInitialState, Screen, AppEvent } from './machine/types';
import { persistCart, loadCart, buildWhatsAppUrl, clearCart } from './machine/effects';
import type { CartEntry, PaymentMethod } from './machine/types';
import type { Language, MenuItem } from './types';
import { ErrorBoundary, TrackingFallback, GuestFallback } from './components/ErrorBoundary';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { openWhatsAppOrder } from './utils/whatsAppNavigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginView } from './views/LoginView';
import { MenuView } from './views/MenuView';
import { CheckoutView } from './views/CheckoutView';
import { TrackingView } from './views/TrackingView';

export default function App() {
  const [lang, setLang] = useState<Language>('EN');
  const [state, dispatch] = useReducer(reducer, createInitialState(loadCart()));

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

  // --- Event dispatchers ---
  const handleLogin = useCallback((room: string, phone: string, lastName: string) => {
    dispatch({
      type: AppEvent.SubmitGuestInfo,
      payload: { roomNumber: room, lastName, phoneNumber: phone },
    });
  }, []);

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
    // UX FIX: Automatically show cart to confirm addition
    dispatch({ type: AppEvent.OpenCart });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    dispatch({ type: AppEvent.RemoveItem, payload: index });
  }, []);

  const handlePlaceOrder = async (method: PaymentMethod, selectedBank: string | null, proof: File | null) => {
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

    const orderData = {
      roomNumber: state.guest.roomNumber,
      phoneNumber: state.guest.phoneNumber,
      lastName: state.guest.lastName,
      items: state.cart,
      subtotal,
      tax,
      total,
      paymentMethod: method,
      status: 'incoming',
      createdAt: serverTimestamp(),
      isRead: false,
    };

    try {
      const docRef = await Promise.race([
        addDoc(collection(db, 'orders'), orderData),
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
      } catch (e) {
        blockedWaUrl = waUrl;
      }

      // Dispatch success
      dispatch({ 
        type: AppEvent.OrderSubmitSucceeded, 
        payload: { id: docRef.id, blockedWaUrl } 
      });

      // Clear persisted cart immediately on success
      clearCart();
    } catch (error: Error | any) {
      console.error('Order save error:', error);
      const isTimeout = error?.message === 'timeout';
      dispatch({ 
        type: AppEvent.OrderSubmitFailed, 
        payload: isTimeout
          ? (lang === 'ID' ? 'Koneksi terlalu lama. Silakan coba lagi.' : 'Connection timeout. Please try again.')
          : (lang === 'ID' ? 'Gagal menyimpan pesanan. Silakan coba lagi.' : 'Failed to save order. Please try again.') 
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
      resetFlow(true);
    }
  }, [lang, resetFlow]);

  // --- Render based on state machine screen ---
  return (
    <ThemeProvider>
      <div className="hcs-mobile-shell min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
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
    </ThemeProvider>
  );
}
