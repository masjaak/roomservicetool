import re

# 1. Fix CheckoutView.tsx
try:
    content = open('src/views/CheckoutView.tsx').read()
    start_idx = content.rfind('  return (')

    new_return = """  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen pb-24"
      style={{ backgroundColor: '#fcfaf7', fontFamily: "'Lato', sans-serif" }}
    >
      <div className="w-full max-w-6xl mx-auto min-h-screen relative">
        {/* Header / Sticky Header */}
        <div className="sticky top-0 z-30 px-6 sm:px-10 pt-6 pb-5 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(252,250,247,0.95)', borderColor: 'rgba(26,26,26,0.06)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 transition-colors hover:bg-gray-100"
              style={{ color: '#1a1a1a', borderRadius: '1px' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-[2rem] leading-[1]" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>
              Reservation Folio
            </h2>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-10 grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20">
          <div className="space-y-12">
            
            <section>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                <Clock className="w-4 h-4 text-[#8a7648]" />
                <h3 className="text-xs tracking-[0.25em] uppercase font-semibold" style={{ color: '#1a1a1a' }}>
                  Billing Method
                </h3>
              </div>
              <div className="grid gap-4">
                {[
                  { id: 'room', label: lang === 'ID' ? 'Tagih ke Kamar' : 'Charge to Room', desc: lang === 'ID' ? 'Akan ditambahkan ke tagihan akhir Anda' : 'Will be added to your final folio' },
                  { id: 'qris', label: 'QRIS', desc: lang === 'ID' ? 'Pembayaran instan via dompet digital' : 'Instant digital wallet payment' },
                  { id: 'bank', label: lang === 'ID' ? 'Transfer Bank' : 'Bank Transfer', desc: lang === 'ID' ? 'Nomor rekening akan ditampilkan' : 'Account details will be provided' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className="flex flex-col text-left p-6 transition-all border"
                    style={{ 
                      backgroundColor: paymentMethod === method.id ? '#1a1a1a' : '#fff',
                      borderColor: paymentMethod === method.id ? '#1a1a1a' : 'rgba(26,26,26,0.1)',
                      color: paymentMethod === method.id ? '#fbfaf8' : '#1a1a1a',
                      borderRadius: '1px'
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-sm font-semibold tracking-wide">{method.label}</span>
                      {paymentMethod === method.id && <CheckCircle2 className="w-4 h-4 text-[#8a7648]" />}
                    </div>
                    <span className="text-xs font-light" style={{ color: paymentMethod === method.id ? 'rgba(251,250,248,0.7)' : '#574b3f' }}>{method.desc}</span>
                  </button>
                ))}
              </div>

              {paymentMethod !== 'room' && (
                <section className="mt-8 p-8 border" style={{ backgroundColor: '#fff', borderColor: 'rgba(26,26,26,0.1)', borderRadius: '1px' }}>
                  <h4 className="text-[9px] uppercase tracking-[0.3em] font-semibold mb-6" style={{ color: '#8a7648' }}>
                    {lang === 'ID' ? 'Unggah Bukti Transfer' : 'Upload Proof of Payment'}
                  </h4>
                  
                  <div className="space-y-6">
                    {paymentMethod === 'bank' && (
                      <div className="grid grid-cols-2 gap-2">
                        {BANKS.map(bank => (
                          <button 
                            key={bank.id}
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3 text-xs border ${selectedBank === bank.id ? 'bg-[#1a1a1a] text-white' : 'bg-[#fff] text-[#1a1a1a]'}`}
                            style={{ borderColor: selectedBank === bank.id ? '#1a1a1a' : 'rgba(26,26,26,0.1)', borderRadius: '1px' }}
                          >
                            {bank.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-light mb-4" style={{ color: '#574b3f' }}>
                        {lang === 'ID' ? 'Silakan unggah bukti tangkapan layar pembayaran Anda:' : 'Please upload your payment screenshot:'}
                      </p>
                      
                      <div 
                        className="relative border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-[#fbfaf8]"
                        style={{ borderColor: transferProof ? '#8a7648' : 'rgba(26,26,26,0.15)', backgroundColor: '#fff', borderRadius: '1px' }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {transferProof ? (
                          <>
                            <CheckCircle2 className="w-8 h-8 text-[#8a7648] mb-4" />
                            <p className="text-sm font-semibold mb-1" style={{ color: '#1a1a1a' }}>{transferProof.name}</p>
                            <p className="text-xs text-[#8a7648]">Tap to change file</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-[#1a1a1a] opacity-30 mb-4" />
                            <p className="text-sm font-semibold mb-1" style={{ color: '#1a1a1a' }}>{lang === 'ID' ? 'Pilih berkas' : 'Select a file'}</p>
                            <p className="text-xs text-[#8a7648]">JPG, PNG max 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </section>
          </div>

          <div className="lg:pl-12 lg:border-l" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
            <div className="sticky top-28 bg-[#fcfaf7]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                <Receipt className="w-4 h-4 text-[#8a7648]" />
                <h3 className="text-xs tracking-[0.25em] uppercase font-semibold" style={{ color: '#1a1a1a' }}>
                  {itemCount} {lang === 'ID' ? 'hidangan terpilih' : 'selected items'}
                </h3>
              </div>

              <div className="space-y-6 mb-10 overflow-y-auto max-h-[300px] pr-2">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.note}`} className="flex gap-5 pb-6 border-b" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold tracking-wide" style={{ color: '#1a1a1a' }}>{item.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-semibold" style={{ color: '#8a7648' }}>{item.qty} ×</span>
                        <span className="text-xs font-semibold tracking-widest">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t mb-12" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                <div className="flex justify-between text-xs font-light" style={{ color: '#574b3f' }}>
                  <span>{t.subtotal}</span>
                  <span className="tracking-widest">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-light" style={{ color: '#574b3f' }}>
                  <span>{t.serviceTax}</span>
                  <span className="tracking-widest">{formatCurrency(taxService)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-4 mt-2 border-t" style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1a1a1a' }}>
                  <span className="tracking-widest uppercase">{t.total}</span>
                  <span className="tracking-widest">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {error && (
                <div className="p-4 mb-8 border border-red-200 bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-widest rounded-sm">
                  {error}
                </div>
              )}

              <button
                onClick={() => onPlaceOrder(paymentMethod, selectedBank, transferProof)}
                disabled={loading || !canSubmit}
                className="w-full flex items-center justify-between py-5 px-6 pointer-events-auto transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:border-transparent border"
                style={{ backgroundColor: '#1a1a1a', color: '#fbfaf8', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1px' }}
              >
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">
                  {loading ? 'Processing...' : lang === 'ID' ? 'Konfirmasi Pesanan' : 'Finalize Reservation'}
                </span>
                {!loading ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tracking-widest">{formatCurrency(grandTotal)}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
"""
    new_content = content[:start_idx] + new_return
    # Add imports to top
    if 'ArrowLeft' not in new_content[:start_idx]:
        new_content = new_content.replace('ChevronLeft', 'ArrowLeft, Clock, Receipt, ChevronLeft')
    open('src/views/CheckoutView.tsx', 'w').write(new_content)
except Exception as e:
    print("Checkout failed", e)

# 2. Fix ItemDetailModal to not have rounded-32px and have Playfair Display and correct layout.
try:
    content = open('src/components/ItemDetailModal.tsx').read()
    start_idx = content.rfind('  return (')
    new_return = """  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#fcfaf7]/90 backdrop-blur-sm z-50 pointer-events-auto"
          />
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-lg bg-white pointer-events-auto overflow-hidden shadow-2xl border flex flex-col max-h-[90vh]"
              style={{ borderRadius: '1px', borderColor: 'rgba(26,26,26,0.1)' }}
            >
              {/* Header Image */}
              <div className="relative h-[45vh] min-h-[300px] w-full bg-[#fbfaf8]">
                <ImageWithFallback 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Close Button overlay */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur border text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white"
                    style={{ borderRadius: '1px', borderColor: 'rgba(26,26,26,0.1)' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content body mapping to a printed order sheet */}
              <div className="flex-1 overflow-y-auto px-8 py-8 styling-sheet border-t" style={{ borderColor: 'rgba(26,26,26,0.1)', fontFamily: "'Lato', sans-serif" }}>
                
                <div className="mb-8">
                  <h2 className="text-[2.2rem] leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>
                    {item.name}
                  </h2>
                  <p className="text-xl tracking-widest font-light" style={{ color: '#8a7648' }}>
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <p className="text-sm leading-relaxed font-light mb-8 pt-6 border-t" style={{ color: '#574b3f', borderColor: 'rgba(26,26,26,0.1)' }}>
                  {item.description}
                </p>

                {item.dietaryTags && item.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {item.dietaryTags.map(tag => (
                      <span key={tag} className="border px-4 py-2 text-[9px] uppercase tracking-[0.25em] font-semibold" style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1a1a1a', borderRadius: '1px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="space-y-6 pt-6 border-t" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: '#1a1a1a' }}>
                      {t.specialInstructions}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={lang === 'ID' ? 'Ketik permintaan khusus di sini...' : 'Type specific preferences here...'}
                      className="w-full text-sm font-light p-4 border focus:ring-0 transition-colors"
                      style={{ backgroundColor: '#fcfaf7', color: '#1a1a1a', borderColor: 'rgba(26,26,26,0.15)', borderRadius: '1px' }}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="p-8 border-t bg-white" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                <div className="flex gap-4">
                  {/* Quantity */}
                  <div className="border flex items-center px-4" style={{ borderColor: 'rgba(26,26,26,0.1)', borderRadius: '1px' }}>
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30"
                      disabled={qty <= 1}
                      style={{ color: '#1a1a1a' }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center" style={{ color: '#1a1a1a' }}>{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-8 h-8 flex items-center justify-center transition-all"
                      style={{ color: '#1a1a1a' }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Add to Cart */}
                  <button
                    onClick={handleAdd}
                    className="flex-1 py-4 px-6 text-[10px] uppercase tracking-[0.25em] font-semibold flex items-center justify-between transition-colors outline-none"
                    style={{ backgroundColor: '#1a1a1a', color: '#fbfaf8', borderRadius: '1px' }}
                  >
                    <span>{t.addToCart}</span>
                    <span style={{ color: 'rgba(251,250,248,0.7)' }}>{formatCurrency(item.price * qty)}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
"""
    new_content = content[:start_idx] + new_return
    open('src/components/ItemDetailModal.tsx', 'w').write(new_content)
except Exception as e:
    print("Item exception:", e)

