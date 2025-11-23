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

    // 1. FORMATTER
    const fmt = (n: number) => 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // 2. HITUNGAN (Subtotal -> Tax -> Total)
    const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxService = rawSubtotal * 0.21;
    const finalTotal = rawSubtotal + taxService;
    
    // Waktu
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // 3. RAKIT PESAN
    // Tips: Jangan pakai simbol '&' mentah di string ini kalau tidak di-encode
    let message = `*🔔 NEW ORDER - ROOM ${roomNumber}* \n`;
    message += `📅 ${dateString} | ⏰ ${timeString}\n`;
    message += `📞 No. Tamu: ${phoneNumber}\n`;
    message += `=============================\n`;
    
    cart.forEach(item => {
      const lineTotal = item.price * item.qty;
      message += `*${item.qty}x ${item.name}*\n`;
      if (item.note) message += `   📝 _Note: ${item.note}_\n`;
      message += `   @ ${fmt(item.price)} = ${fmt(lineTotal)}\n`;
      message += `\n`;
    });

    message += `=============================\n`;
    message += `Subtotal: ${fmt(rawSubtotal)}\n`;
    // Ganti '&' jadi 'and' atau '+' biar aman di mata manusia,
    // TAPI karena kita pakai encodeURIComponent di bawah, '&' juga bakal aman sekarang.
    message += `Service & Tax (21%): ${fmt(taxService)}\n`; 
    message += `*💰 TOTAL BILL: ${fmt(finalTotal)}*\n`;
    message += `=============================\n`;
    
    let paymentText = "";
    if (method === 'room') paymentText = "CHARGE TO ROOM 🏨";
    if (method === 'qris') paymentText = "QRIS / E-WALLET 📱";
    if (method === 'bank') paymentText = "BANK TRANSFER 💳";

    message += `Metode Bayar: *${paymentText}*\n`;
    
    if (method !== 'room') {
      message += `\n_(Mohon lampirkan BUKTI TRANSFER di sini)_\n`;
    }
    
    message += `\n_Mohon segera diproses. Terima Kasih!_ 🙏`;

    // 4. KIRIM (DENGAN ENCODE)
    const staffPhoneNumber = "6281285864059"; // GANTI NOMOR INI

    setTimeout(() => {
      setIsProcessing(false);
      
      // --- INI KUNCINYA ---
      // Kita pakai encodeURIComponent(message)
      // Ini akan mengubah '&' menjadi '%26' dan Enter menjadi '%0A' secara otomatis
      // Jadi pesannya TIDAK AKAN TERPOTONG lagi.
      window.open(`https://wa.me/${staffPhoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
      
      setView('tracking');
      setCart([]);
      localStorage.removeItem('ciputra_cart');
    }, 1500);
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
