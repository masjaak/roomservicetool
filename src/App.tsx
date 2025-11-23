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

  // --- UPDATE BAGIAN INI DI APP.TSX ---

  const handlePlaceOrder = (method: string, proof: File | null) => {
    setIsProcessing(true);

    // 1. FORMATTER RUPIAH (Manual biar rapi di WA)
    // Contoh: 45000 -> "Rp 45.000"
    const fmt = (n: number) => 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // 2. HITUNG MATEMATIKA (Sesuai Summary Checkout)
    // Subtotal: Harga murni makanan
    const rawSubtotal = cart.reduce((sum, item) => {
      return sum + (item.price * item.qty); 
    }, 0);
    
    // Tax & Service: 21% dari Subtotal
    const taxService = rawSubtotal * 0.21;
    
    // Total Akhir: Subtotal + Tax
    const finalTotal = rawSubtotal + taxService;
    
    // Waktu Order
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // 3. RAKIT PESAN WHATSAPP
    let message = `*🔔 NEW ORDER - ROOM ${roomNumber}* %0A`;
    message += `📅 ${dateString} | ⏰ ${timeString}%0A`;
    message += `📞 No. Tamu: ${phoneNumber}%0A`;
    message += `=============================%0A`;
    
    // List Item
    cart.forEach(item => {
      // Hitung total per baris (Harga x Qty)
      const lineTotal = item.price * item.qty;
      
      message += `*${item.qty}x ${item.name}*%0A`;
      if (item.note) message += `   📝 _Note: ${item.note}_%0A`;
      message += `   @ ${fmt(item.price)} = ${fmt(lineTotal)}%0A`;
      message += `%0A`;
    });

    // BAGIAN SUMMARY (Sesuai Request Kamu)
    message += `=============================%0A`;
    message += `Subtotal: ${fmt(rawSubtotal)}%0A`;
    message += `Service & Tax (21%): ${fmt(taxService)}%0A`;
    message += `*💰 TOTAL: ${fmt(finalTotal)}*%0A`;
    message += `=============================%0A`;
    
    // Info Pembayaran
    let paymentText = "";
    if (method === 'room') paymentText = "CHARGE TO ROOM 🏨";
    if (method === 'qris') paymentText = "QRIS / E-WALLET 📱";
    if (method === 'bank') paymentText = "BANK TRANSFER 💳";

    message += `Metode Bayar: *${paymentText}*%0A`;
    
    if (method !== 'room') {
      message += `%0A_(Mohon lampirkan BUKTI TRANSFER di sini)_%0A`;
    }
    
    message += `%0A_Mohon segera diproses. Terima Kasih!_ 🙏`;

    // 4. KIRIM
    const staffPhoneNumber = "6281285864059"; // ⚠️ GANTI DENGAN NOMOR WA RESTO ASLI

    setTimeout(() => {
      setIsProcessing(false);
      window.open(`https://wa.me/${staffPhoneNumber}?text=${message}`, '_blank');
      
      // Reset App
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
