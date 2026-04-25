import type { CartItem, MenuItem } from '../types';

const MAX_SUGGESTIONS = 2;

const PAIRING_IDS = {
  mains: [21, 27, 20, 26],
  signatures: [21, 27, 22, 30],
  starters: [12, 16, 18, 26],
  desserts: [25, 28, 29, 30],
  beverages: [23, 20, 21, 22],
};

function getCategoryPresence(cart: CartItem[]) {
  return {
    hasStarters: cart.some((item) => item.category === 'Starters'),
    hasMains: cart.some((item) => item.category === 'Mains'),
    hasSignatures: cart.some((item) => item.category === 'Signatures'),
    hasDesserts: cart.some((item) => item.category === 'Desserts'),
    hasBeverages: cart.some((item) => item.category === 'Beverages'),
  };
}

function buildPriorityIds(cart: CartItem[]): number[] {
  const presence = getCategoryPresence(cart);
  const ids: number[] = [];

  if ((presence.hasMains || presence.hasSignatures) && !presence.hasDesserts) {
    ids.push(...(presence.hasSignatures ? PAIRING_IDS.signatures : PAIRING_IDS.mains));
  }

  if ((presence.hasMains || presence.hasSignatures || presence.hasDesserts) && !presence.hasBeverages) {
    ids.push(27, 26, 30, 25);
  }

  if (presence.hasStarters && !presence.hasMains && !presence.hasSignatures) {
    ids.push(...PAIRING_IDS.starters);
  }

  if (presence.hasDesserts && !presence.hasBeverages) {
    ids.push(...PAIRING_IDS.desserts);
  }

  if (presence.hasBeverages && !presence.hasDesserts && !presence.hasMains && !presence.hasSignatures) {
    ids.push(...PAIRING_IDS.beverages);
  }

  if (ids.length === 0) {
    ids.push(27, 20, 26, 21);
  }

  return ids;
}

export function getCartPairingSuggestions(cart: CartItem[], menuItems: MenuItem[]): MenuItem[] {
  if (cart.length === 0) {
    return [];
  }

  const cartItemIds = new Set(cart.map((item) => item.id));
  const menuById = new Map(menuItems.map((item) => [item.id, item]));
  const suggestions: MenuItem[] = [];
  const seenIds = new Set<number>();

  for (const id of buildPriorityIds(cart)) {
    const item = menuById.get(id);

    if (!item || cartItemIds.has(id) || seenIds.has(id)) {
      continue;
    }

    suggestions.push(item);
    seenIds.add(id);

    if (suggestions.length >= MAX_SUGGESTIONS) {
      break;
    }
  }

  return suggestions;
}
