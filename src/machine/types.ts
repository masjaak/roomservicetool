// ---------------------------------------------------------------------------
// State Machine Types — Atelier Meridian Room Service
// ---------------------------------------------------------------------------

/** Application screens (cart is a modal overlay, not a screen) */
export enum Screen {
  Welcome = 'welcome',
  Menu = 'menu',
  Checkout = 'checkout',
  Confirmed = 'confirmed',
}

/** Events the UI can dispatch */
export enum AppEvent {
  SubmitGuestInfo = 'submitGuestInfo',
  BrowseCategory = 'browseCategory',
  Search = 'search',
  AddItem = 'addItem',
  RemoveItem = 'removeItem',
  EditNote = 'editNote',
  OpenCart = 'openCart',
  CloseCart = 'closeCart',
  StartCheckout = 'startCheckout',
  BackFromCheckout = 'backFromCheckout',
  SelectPaymentMethod = 'selectPaymentMethod',
  SubmitOrder = 'submitOrder',
  OrderSubmitSucceeded = 'orderSubmitSucceeded',
  OrderSubmitFailed = 'orderSubmitFailed',
  FinishOrder = 'finishOrder',
  ResetFlow = 'resetFlow',
}

/** Payment methods */
export type PaymentMethod = 'room' | 'qris' | 'bank';

/** Guest information collected at welcome screen */
export interface GuestInfo {
  roomNumber: string;
  lastName: string;
  phoneNumber: string;
}

/** A single item in the cart */
export interface CartEntry {
  id: number;
  name: string;
  price: number;
  qty: number;
  note: string;
  image: string;
  description: string;
  category: string;
  tag: string;
  allergens: string;
}

/** Full application state managed by the reducer */
export interface AppState {
  screen: Screen;
  /** Cart drawer is a modal overlay on Menu, not a screen */
  isCartOpen: boolean;
  guest: GuestInfo;
  cart: CartEntry[];
  selectedCategory: string;
  searchQuery: string;
  paymentMethod: PaymentMethod;
  selectedBank: string | null;
  hasPaymentProof: boolean;
  orderId: string | null;
  isProcessing: boolean;
  checkoutError: string | null;
  blockedWaUrl: string | null;
  /** Set when an invalid transition is attempted */
  lastRejectedEvent: AppEvent | null;
}

/** Discriminated union of all actions */
export type Action =
  | { type: AppEvent.SubmitGuestInfo; payload: GuestInfo }
  | { type: AppEvent.BrowseCategory; payload: string }
  | { type: AppEvent.Search; payload: string }
  | { type: AppEvent.AddItem; payload: { item: Omit<CartEntry, 'qty' | 'note'>; qty: number; note: string } }
  | { type: AppEvent.RemoveItem; payload: number } // index
  | { type: AppEvent.EditNote; payload: { index: number; note: string } }
  | { type: AppEvent.OpenCart }
  | { type: AppEvent.CloseCart }
  | { type: AppEvent.StartCheckout }
  | { type: AppEvent.BackFromCheckout }
  | { type: AppEvent.SelectPaymentMethod; payload: { method: PaymentMethod; selectedBank: string | null; hasProof: boolean } }
  | { type: AppEvent.SubmitOrder }
  | { type: AppEvent.OrderSubmitSucceeded; payload: { id: string; blockedWaUrl: string | null } }
  | { type: AppEvent.OrderSubmitFailed; payload: string }
  | { type: AppEvent.FinishOrder }
  | { type: AppEvent.ResetFlow };

/** Initial state factory */
export function createInitialState(cart: CartEntry[] = []): AppState {
  return {
    screen: Screen.Welcome,
    isCartOpen: false,
    guest: { roomNumber: '', lastName: '', phoneNumber: '' },
    cart,
    selectedCategory: 'Signatures',
    searchQuery: '',
    paymentMethod: 'room',
    selectedBank: null,
    hasPaymentProof: false,
    orderId: null,
    isProcessing: false,
    checkoutError: null,
    blockedWaUrl: null,
    lastRejectedEvent: null,
  };
}
