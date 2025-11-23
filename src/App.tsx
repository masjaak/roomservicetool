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

  // --- GANTI FUNGSI HANDLEPLACEORDER DENGAN INI ---

  const handlePlaceOrder = (method: string, proof: File | null) => {
    setIsProcessing(true);

    // 1. SIAPKAN DATA & FORMATTER KHUSUS WA
    // Kita pakai formatter manual biar simbol  tidak muncul di WA
    const fmt = (n: number) => 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.21;
    const total = subtotal + tax;
    
    // Ambil Waktu Sekarang (Biar dapur tau jam order)
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // 2. RAKIT PESAN WHATSAPP (VERSI PRO)
    let message = `*🔔 NEW ORDER - ROOM ${roomNumber}* %0A`;
    message += `📅 ${dateString} | ⏰ ${timeString}%0A`;
    message += `📞 No. Tamu: ${phoneNumber}%0A`;
    message += `=============================%0A`;
    message += `*📋 ITEM PESANAN:*%0A`;
    
    cart.forEach(item => {
      message += `%0A*${item.qty}x ${item.name}*%0A`;
      // Kalau ada note, kasih formatting miring biar kelihatan
      if (item.note) message += `   📝 _Note: ${item.note}_%0A`; 
      message += `   @ ${fmt(item.price)}%0A`;
    });

    message += `=============================%0A`;
    message += `Subtotal: ${fmt(subtotal)}%0A`;
    message += `Service & Tax (21%): ${fmt(tax)}%0A`;
    message += `*💰 TOTAL BILL: ${fmt(total)}*%0A`;
    message += `=============================%0A`;
    
    // Info Pembayaran
    let paymentText = "";
    if (method === 'room') paymentText = "CHARGE TO ROOM 🏨";
    if (method === 'qris') paymentText = "QRIS / E-WALLET 📱";
    if (method === 'bank') paymentText = "BANK TRANSFER 💳";

    message += `Metode Bayar: *${paymentText}*%0A`;
    
    if (method !== 'room') {
      message += `%0A⚠️ *PENTING:*%0A`;
      message += `Tamu dimohon melampirkan BUKTI TRANSFER (Foto/Screenshot) di chat ini agar pesanan dapat diproses.%0A`;
    }
    
    message += `%0A_Mohon segera dikonfirmasi. Terima Kasih!_ 🙏`;

    // 3. KIRIM
    const staffPhoneNumber = "6281234567890"; // JANGAN LUPA GANTI NOMOR INI

    setTimeout(() => {
      setIsProcessing(false);
      window.open(`https://wa.me/${staffPhoneNumber}?text=${message}`, '_blank');
      
      // Reset App
      setView('tracking');
      setCart([]);
      localStorage.removeItem('ciputra_cart');
    }, 1500);
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
