import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { reducer } from './machine/reducer';
import { createInitialState, Screen, AppEvent } from './machine/types';
import { persistCart, loadCart, buildWhatsAppUrl, clearCart } from './machine/effects';
import type { CartEntry, PaymentMethod } from './machine/types';
import type { Language, MenuItem } from './types';
import { LoginView } from './views/LoginView';
import { MenuView } from './views/MenuView';
import { CheckoutView } from './views/CheckoutView';
import { TrackingView } from './views/TrackingView';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [lang, setLang] = useState<Language>('EN');
  const [state, dispatch] = useReducer(reducer, createInitialState(loadCart()));

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
        const newWin = window.open(waUrl, '_blank');
        if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
          blockedWaUrl = waUrl;
        }
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

  // --- Render based on state machine screen ---
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf8f5', fontFamily: "'Inter', sans-serif" }}>
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
          <MenuView
            key="menu"
            roomNumber={state.guest.roomNumber}
            cart={state.cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            onCheckout={() => dispatch({ type: AppEvent.StartCheckout })}
            onOpenCart={() => dispatch({ type: AppEvent.OpenCart })}
            onCloseCart={() => dispatch({ type: AppEvent.CloseCart })}
            onLogout={() => {
              if (window.confirm(lang === 'ID' ? 'Ganti kamar? Pesanan akan dikosongkan.' : 'Switch rooms? Your order will be cleared.')) {
                dispatch({ type: AppEvent.ResetFlow });
                clearCart();
              }
            }}
            isCartOpen={state.isCartOpen}
            lang={lang}
          />
        )}

        {state.screen === Screen.Checkout && (
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
        )}

        {state.screen === Screen.Confirmed && (
          <TrackingView
            key="tracking"
            roomNumber={state.guest.roomNumber}
            onFinish={handleFinishOrder}
            lang={lang}
            orderId={state.orderId}
            blockedWaUrl={state.blockedWaUrl}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
