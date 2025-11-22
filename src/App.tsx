import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { ViewState, Language, CartItem, MenuItem } from './types';
import { LoginView } from './views/LoginView';
import { MenuView } from './views/MenuView';
import { CheckoutView } from './views/CheckoutView';
import { TrackingView } from './views/TrackingView';

export default function App() {
  // --- STATE ---
  const [view, setView] = useState<ViewState>('login'); 
  const [lang, setLang] = useState<Language>('EN');
  
  // User Info
  const [roomNumber, setRoomNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ciputra_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Checkout State
  const [isProcessing, setIsProcessing] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('ciputra_cart', JSON.stringify(cart));
  }, [cart]);

  // --- HANDLERS ---
  const handleLogin = (room: string, phone: string) => {
    setRoomNumber(room);
    setPhoneNumber(phone);
    setView('menu');
  };

  const addToCart = (item: MenuItem, qty: number, note: string) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(i => i.id === item.id && i.note === note);
      if (existingIdx >= 0) {
        const newCart = [...prev];
        newCart[existingIdx].qty += qty;
        return newCart;
      }
      return [...prev, { ...item, qty, note }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart.splice(index, 1);
      return newCart;
    });
  };

  const handlePlaceOrder = (method: string, proof: File | null) => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setView('tracking');
      setCart([]);
      localStorage.removeItem('ciputra_cart');
    }, 2000);
  };

  const handleFinishOrder = () => {
    setRoomNumber("");
    setPhoneNumber("");
    setView('login');
  };

  // --- RENDER ---
  return (
    <div className="bg-slate-50 min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <LoginView 
            key="login"
            lang={lang} 
            setLang={setLang} 
            onLogin={handleLogin} 
          />
        )}

        {view === 'menu' && (
          <MenuView 
            key="menu"
            roomNumber={roomNumber}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            onCheckout={() => setView('checkout')}
            lang={lang}
          />
        )}

        {view === 'checkout' && (
          <CheckoutView 
            key="checkout"
            cart={cart}
            onBack={() => setView('menu')}
            onPlaceOrder={handlePlaceOrder}
            loading={isProcessing}
            phoneNumber={phoneNumber}
            lang={lang}
          />
        )}

        {view === 'tracking' && (
          <TrackingView 
            key="tracking"
            roomNumber={roomNumber}
            onFinish={handleFinishOrder}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
