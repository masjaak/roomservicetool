import type { CartItem, MenuItem } from '../types';

const MAX_SUGGESTIONS = 4;

const PAIRING_IDS = {
  mains: [21, 20, 27, 26, 22, 30],
  signatures: [21, 22, 27, 30, 20, 26],
  starters: [12, 16, 18, 14, 26, 27],
  desserts: [27, 25, 28, 29, 30, 26],
  beverages: [23, 20, 21, 22, 12, 16],
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
    ids.push(27, 26, 30, 25, 29, 28);
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

  if ((presence.hasMains || presence.hasSignatures) && !presence.hasStarters) {
    ids.push(6, 7, 9, 10);
  }

  if (presence.hasBeverages && !presence.hasDesserts) {
    ids.push(20, 21, 22, 23);
  }

  if (ids.length === 0) {
    ids.push(27, 20, 26, 21, 22, 30);
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
