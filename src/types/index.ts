export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tag: string;
  allergens: string;
}

export interface CartItem extends MenuItem {
  qty: number;
  note: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
}

export type ViewState = 'login' | 'menu' | 'checkout' | 'tracking';
export type Language = 'EN' | 'ID';
