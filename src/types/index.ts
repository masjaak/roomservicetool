export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tag: string;
  allergens: string;
  prepTime?: string;
  dietaryTags?: string[];
  spiceLevel?: 'None' | 'Mild' | 'Medium' | 'Hot';
  serviceTag?: 'Chef Recommendation' | 'Best Seller' | 'Local Favourite' | 'Light Option' | string;
  isAvailable?: boolean;
  unavailableReason?: string;
}

export interface FeedbackPayload {
  overallRating: number;
  foodQuality?: number;
  presentation?: number;
  deliverySpeed?: number;
  orderAccuracy?: number;
  staffCourtesy?: number;
  valueForMoney?: number;
  wouldOrderAgain?: 'yes' | 'no';
  comment: string;
  requestManagerFollowUp?: 'yes' | 'no';
  issueCategory?: 'Food quality' | 'Temperature' | 'Late delivery' | 'Wrong item' | 'Packaging' | 'Staff service' | 'Other';
  issueNote?: string;
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

export type ViewState = 'welcome' | 'menu' | 'cart-open' | 'checkout' | 'confirmed';
export type Language = 'EN' | 'ID';
