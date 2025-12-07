import { MenuItem, Bank } from '../types';

export const CATEGORIES = ["PROMO", "Appetizer", "Main Course", "Dessert", "Beverage"];

export const BANKS: Bank[] = [
  { id: 'bca', name: 'BCA', code: '88010' },
  { id: 'mandiri', name: 'Mandiri', code: '89022' },
  { id: 'bni', name: 'BNI', code: '8241' }
];

export const PROMO_BANNERS = [
  { id: 1, image: "https://i.ibb.co.com/YsP7hQ2/test2.jpg", title: "HANTARAN PACKAGE" },
  { id: 2, image: "https://i.ibb.co.com/Kcrp2Bjk/test3.jpg", title: "PROMO NOVEMBER - DECEMBER" },
  { id: 3, image: "https://i.ibb.co.com/RpcQtXGZ/test1.jpg", title: "CHRISTMAS DINNER" },
];

export const TRANSLATIONS = {
  EN: {
    subtitle: "Exquisite dining, delivered to your room",
    start: "Start Dining",
    room: "Room Number",
    phone: "Phone Number",
    help: "Trouble logging in? Call Our Staff",
    cart: "Your Cart",
    total: "Total",
    checkout: "Checkout",
    placeOrder: "Place Order",
    successTitle: "Order Received",
    trackTitle: "Order Status",
    rateTitle: "How was your meal?",
    rateDesc: "Tap a star to rate.",
    submit: "Submit Feedback",
    free: "COMPLIMENTARY",
    morning: "Good Morning,",
    afternoon: "Good Afternoon,",
    evening: "Good Evening,",
    addToCart: "Add to Order",
    notesPlaceholder: "Notes (e.g. extra spicy, no onions)...",
    containsAllergens: "Contains Allergens",
    paymentMethod: "Payment Method",
    chargeRoom: "Charge to Room",
    bankTransfer: "Bank Transfer",
    uploadProof: "Upload Payment Proof",
    scanQris: "Scan via GoPay/OVO/BCA Mobile",
    backToMenu: "Back to Menu",
    subtotal: "Subtotal",
    serviceTax: "Service & Tax (21%)",
    processing: "Processing...",
    uploadPrompt: "Click to upload screenshot",
    fileSelected: "File selected",
    remove: "Remove",
    emptyCart: "Your cart is empty"
  },
  ID: {
    subtitle: "The Gallery Restaurant - Layanan Kamar",
    start: "Mulai Pesan",
    room: "Nomor Kamar",
    phone: "Nomor Handphone",
    help: "Kendala login? Hubungi Resepsionis",
    cart: "Keranjang",
    total: "Total",
    checkout: "Pembayaran",
    placeOrder: "Pesan Sekarang",
    successTitle: "Pesanan Diterima",
    trackTitle: "Status Pesanan",
    rateTitle: "Bagaimana makanan Anda?",
    rateDesc: "Ketuk bintang untuk menilai.",
    submit: "Kirim Ulasan",
    free: "GRATIS",
    morning: "Selamat Pagi,",
    afternoon: "Selamat Siang,",
    evening: "Selamat Malam,",
    addToCart: "Tambah Pesanan",
    notesPlaceholder: "Catatan (misal: pedas, tanpa bawang)...",
    containsAllergens: "Mengandung Alergen",
    paymentMethod: "Metode Pembayaran",
    chargeRoom: "Tagih ke Kamar",
    bankTransfer: "Transfer Bank",
    uploadProof: "Unggah Bukti Bayar",
    scanQris: "Scan via GoPay/OVO/BCA Mobile",
    backToMenu: "Kembali ke Menu",
    subtotal: "Subtotal",
    serviceTax: "Layanan & Pajak (21%)",
    processing: "Memproses...",
    uploadPrompt: "Klik untuk unggah tangkapan layar",
    fileSelected: "File terpilih",
    remove: "Hapus",
    emptyCart: "Keranjang kosong"
  }
};

export const MENU_ITEMS: MenuItem[] = [
  // PROMO
  {
    id: 41,
    name: "Wagyu Beef Rendang",
    description: "Premium Australian Wagyu beef slow-cooked in rich coconut curry sauce, served with steamed rice and sambal.",
    price: 285000,
    category: "PROMO",
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80",
    tag: "Monthly Special",
    allergens: "Dairy, Nuts"
  },
  {
    id: 42,
    name: "Lobster Thermidor",
    description: "Fresh lobster tail baked with creamy cheese sauce, served with garlic butter rice and grilled asparagus.",
    price: 425000,
    category: "PROMO",
    image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=800&q=80",
    tag: "Chef's Special",
    allergens: "Seafood, Dairy, Alcohol"
  },

  // APPETIZER
  {
    id: 1,
    name: "Lumpia Semarang",
    description: "Famous local spring rolls with bamboo shoots, served with sweet garlic sauce.",
    price: 45000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1606101273945-e9eba91c0dc4?auto=format&fit=crop&w=800&q=80",
    tag: "Local Icon",
    allergens: "Wheat, Shrimp"
  },
  {
    id: 2,
    name: "Tahu Gimbal",
    description: "Fried tofu, prawn fritters, egg, and vegetables with peanut sauce.",
    price: 55000,
    category: "Appetizer",
    image: "https://assets-pergikuliner.com/18yT7S_zJ4k1d6rL2e4k8pZ5nQk=/fit-in/1366x768/smart/filters:no_upscale()/https://assets-pergikuliner.com/uploads/image/picture/1585549/picture-1568183594.jpg",
    tag: "Semarang Special",
    allergens: "Peanut, Egg, Shrimp"
  },
  {
    id: 3,
    name: "Classic Caesar Salad",
    description: "Romaine lettuce, parmesan cheese, beef bacon, croutons, and caesar dressing.",
    price: 85000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
    tag: "Healthy",
    allergens: "Dairy, Egg"
  },
  {
    id: 4,
    name: "Calamari Rings",
    description: "Deep fried squid rings served with tartar sauce.",
    price: 75000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Seafood, Wheat"
  },
  {
    id: 5,
    name: "Cream of Mushroom Soup",
    description: "Rich creamy mushroom soup served with garlic bread.",
    price: 65000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1547592166-23acbe3a624b?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Dairy"
  },
  {
    id: 6,
    name: "Chicken Wings",
    description: "Fried chicken wings glazed with honey bbq sauce.",
    price: 70000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
    tag: "Best Seller",
    allergens: "Wheat"
  },
  {
    id: 7,
    name: "Gado Gado",
    description: "Indonesian vegetable salad with peanut dressing and crackers.",
    price: 60000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1625220249804-e85eb685959d?auto=format&fit=crop&w=800&q=80",
    tag: "Vegetarian",
    allergens: "Peanut"
  },
  {
    id: 8,
    name: "French Fries",
    description: "Shoestring fries served with chili sauce and mayonnaise.",
    price: 45000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: ""
  },
  {
    id: 9,
    name: "Nachos Grande",
    description: "Tortilla chips topped with melted cheese, salsa, and jalapenos.",
    price: 80000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80",
    tag: "Sharing",
    allergens: "Dairy, Corn"
  },
  {
    id: 10,
    name: "Tomato Bruschetta",
    description: "Toasted baguette topped with fresh tomatoes, basil, and olive oil.",
    price: 55000,
    category: "Appetizer",
    image: "https://images.unsplash.com/photo-1572695157369-a0eac0d6bbc9?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Wheat"
  },

  // MAIN COURSE
  {
    id: 11,
    name: "Nasi Goreng Ciputra",
    description: "Signature fried rice with satay, fried chicken, and sunny side up egg.",
    price: 115000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    tag: "Signature",
    allergens: "Egg, Peanut, Shrimp"
  },
  {
    id: 12,
    name: "Sop Buntut",
    description: "Legendary oxtail soup (fried/grilled/boiled) with rice and crackers.",
    price: 185000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80",
    tag: "Chef Rec",
    allergens: "Nutmeg"
  },
  {
    id: 13,
    name: "Soto Ayam Semarang",
    description: "Traditional turmeric chicken soup with glass noodles, served with rice.",
    price: 85000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&w=800&q=80",
    tag: "Local",
    allergens: "Egg"
  },
  {
    id: 14,
    name: "Ciputra Club Sandwich",
    description: "Triple decker sandwich with chicken, bacon, egg, lettuce, tomato.",
    price: 95000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Wheat, Egg"
  },
  {
    id: 15,
    name: "Australian Sirloin Steak",
    description: "200g grilled sirloin served with potato wedges and mushroom sauce.",
    price: 250000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80",
    tag: "Premium",
    allergens: "Dairy"
  },
  {
    id: 16,
    name: "Norwegian Salmon",
    description: "Pan-seared salmon fillet with lemon butter sauce and mashed potatoes.",
    price: 210000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800&q=80",
    tag: "Healthy",
    allergens: "Fish, Dairy"
  },
  {
    id: 17,
    name: "Beef Burger",
    description: "Juicy beef patty with cheese, caramelized onion, served with fries.",
    price: 110000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Wheat, Dairy"
  },
  {
    id: 18,
    name: "Spaghetti Bolognaise",
    description: "Classic pasta with minced beef and tomato sauce.",
    price: 95000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=800&q=80",
    tag: "Kids Friendly",
    allergens: "Wheat"
  },
  {
    id: 19,
    name: "Mie Goreng Jawa",
    description: "Javanese style fried noodles with chicken and vegetables.",
    price: 85000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1612927601601-6638404e45e8?auto=format&fit=crop&w=800&q=80",
    tag: "Local",
    allergens: "Wheat, Egg"
  },
  {
    id: 20,
    name: "Fish and Chips",
    description: "Battered dory fish served with french fries and tartar sauce.",
    price: 90000,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Fish, Wheat"
  },

  // DESSERT
  {
    id: 21,
    name: "Pisang Goreng Keju",
    description: "Fried banana topped with grated cheese and chocolate sprinkles.",
    price: 55000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1564665978126-4b54c5890833?auto=format&fit=crop&w=800&q=80",
    tag: "Local Fav",
    allergens: "Dairy"
  },
  {
    id: 22,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream.",
    price: 75000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80",
    tag: "Best Seller",
    allergens: "Dairy, Egg, Wheat"
  },
  {
    id: 23,
    name: "Tropical Fruit Platter",
    description: "Assorted seasonal fresh sliced fruits.",
    price: 50000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1519996529931-28324d1a6390?auto=format&fit=crop&w=800&q=80",
    tag: "Healthy",
    allergens: ""
  },
  {
    id: 24,
    name: "New York Cheesecake",
    description: "Creamy cheesecake with strawberry compote.",
    price: 70000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Dairy, Wheat"
  },
  {
    id: 25,
    name: "Es Campur",
    description: "Indonesian mixed ice dessert with jelly, fruits, and syrup.",
    price: 55000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?auto=format&fit=crop&w=800&q=80",
    tag: "Refreshing",
    allergens: "Dairy"
  },
  {
    id: 26,
    name: "Creme Brulee",
    description: "Classic french custard with caramelized sugar crust.",
    price: 65000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Dairy, Egg"
  },
  {
    id: 27,
    name: "Es Puter Conglik",
    description: "Traditional coconut ice cream with durian and avocado topping.",
    price: 55000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80",
    tag: "Semarang Icon",
    allergens: "Dairy"
  },
  {
    id: 28,
    name: "Apple Tart",
    description: "Warm apple tart served with vanilla sauce.",
    price: 65000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Wheat"
  },
  {
    id: 29,
    name: "Ice Cream Scoop",
    description: "Choice of Vanilla, Chocolate, or Strawberry.",
    price: 35000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Dairy"
  },
  {
    id: 30,
    name: "Opera Cake",
    description: "Layers of almond sponge, coffee buttercream, and chocolate ganache.",
    price: 75000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Dairy, Wheat, Nuts"
  },

  // BEVERAGE
  {
    id: 31,
    name: "Iced Cappuccino",
    description: "Freshly brewed espresso with cold milk and foam.",
    price: 45000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Dairy, Caffeine"
  },
  {
    id: 32,
    name: "Fresh Orange Juice",
    description: "Squeezed from fresh oranges, no sugar added.",
    price: 55000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
    tag: "Healthy",
    allergens: ""
  },
  {
    id: 33,
    name: "Avocado Coffee",
    description: "Creamy avocado juice topped with espresso shot and chocolate syrup.",
    price: 60000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=800&q=80",
    tag: "Barista Rec",
    allergens: "Dairy, Caffeine"
  },
  {
    id: 34,
    name: "Wedang Jahe",
    description: "Traditional hot ginger drink with palm sugar.",
    price: 40000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1596803244618-8dabe4f9d771?auto=format&fit=crop&w=800&q=80",
    tag: "Local Healing",
    allergens: ""
  },
  {
    id: 35,
    name: "Iced Lemon Tea",
    description: "Refreshing black tea with fresh lemon slices.",
    price: 35000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: ""
  },
  {
    id: 36,
    name: "Watermelon Juice",
    description: "Freshly blended watermelon.",
    price: 50000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: ""
  },
  {
    id: 37,
    name: "Hot Chocolate",
    description: "Rich hot cocoa served with marshmallows.",
    price: 50000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: "Dairy"
  },
  {
    id: 38,
    name: "Mineral Water (Equil)",
    description: "Premium natural sparkling mineral water (380ml).",
    price: 45000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1560130958-f69704284a37?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: ""
  },
  {
    id: 39,
    name: "Bintang Beer",
    description: "Indonesian pilsner beer (330ml).",
    price: 75000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1634486654235-5d4a5e2c7600?auto=format&fit=crop&w=800&q=80",
    tag: "21+",
    allergens: "Alcohol"
  },
  {
    id: 40,
    name: "Coca Cola",
    description: "Classic carbonated soft drink.",
    price: 35000,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    tag: "",
    allergens: ""
  }
];