import type { MenuItem, TimeSlot } from '../types';

const TIME_SLOT_VALUES: TimeSlot[] = ['morning', 'afternoon', 'evening', 'latenight'];
const CUSTOM_MENU_ID_BASE = 900_000;
const DEFAULT_ALLERGEN_NOTE = 'Please confirm allergens with room service.';

export interface GuestMenuProductRecord {
  id: string;
  sourceItemId?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tag?: string;
  allergens?: string;
  dietaryTags?: string[];
  spiceLevel?: MenuItem['spiceLevel'];
  serviceTag?: MenuItem['serviceTag'];
  isAvailable: boolean;
  unavailableReason?: string;
  timeSlots?: TimeSlot[];
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const next = value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
  return next.length ? next : undefined;
}

function normalizeTimeSlots(value: unknown): TimeSlot[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const next = value.filter((entry): entry is TimeSlot => (
    typeof entry === 'string' && TIME_SLOT_VALUES.includes(entry as TimeSlot)
  ));
  return next.length ? next : undefined;
}

function normalizeMenuName(value: string): string {
  return value.trim().toLowerCase();
}

function buildCustomMenuId(seed: string): number {
  let hash = 0;
  for (const char of seed) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    hash |= 0;
  }
  return CUSTOM_MENU_ID_BASE + Math.abs(hash % 90_000);
}

function toCustomGuestMenuItem(product: GuestMenuProductRecord): MenuItem {
  return {
    id: buildCustomMenuId(product.id),
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    tag: product.tag || product.serviceTag || 'Custom Creation',
    allergens: product.allergens?.trim() || DEFAULT_ALLERGEN_NOTE,
    dietaryTags: product.dietaryTags,
    spiceLevel: product.spiceLevel,
    serviceTag: product.serviceTag,
    isAvailable: product.isAvailable,
    unavailableReason: product.unavailableReason,
    timeSlots: product.timeSlots,
  };
}

export function toGuestMenuSourceItemId(itemId: number | string): string {
  return `guest-menu-${itemId}`;
}

export function normalizeGuestMenuProduct(docId: string, data: Record<string, unknown>): GuestMenuProductRecord {
  return {
    id: docId,
    sourceItemId: typeof data.sourceItemId === 'string' ? data.sourceItemId : undefined,
    name: typeof data.name === 'string' ? data.name : 'Untitled item',
    description: typeof data.description === 'string' ? data.description : '',
    price: typeof data.price === 'number' ? data.price : 0,
    category: typeof data.category === 'string' ? data.category : 'Mains',
    image: typeof data.image === 'string' ? data.image : '',
    tag: typeof data.tag === 'string' ? data.tag : undefined,
    allergens: typeof data.allergens === 'string' ? data.allergens : undefined,
    dietaryTags: normalizeStringArray(data.dietaryTags),
    spiceLevel: ['None', 'Mild', 'Medium', 'Hot'].includes(String(data.spiceLevel))
      ? data.spiceLevel as MenuItem['spiceLevel']
      : undefined,
    serviceTag: typeof data.serviceTag === 'string' ? data.serviceTag : undefined,
    isAvailable: data.isAvailable !== false,
    unavailableReason: typeof data.unavailableReason === 'string' ? data.unavailableReason : undefined,
    timeSlots: normalizeTimeSlots(data.timeSlots),
  };
}

export function mergeGuestMenuCatalog(baseMenu: MenuItem[], productRecords: GuestMenuProductRecord[]): MenuItem[] {
  const remainingProducts = new Map(productRecords.map((product) => [product.id, product]));
  const overridesBySource = new Map(
    productRecords
      .filter((product) => typeof product.sourceItemId === 'string' && product.sourceItemId.trim().length > 0)
      .map((product) => [product.sourceItemId as string, product]),
  );
  const overridesByName = new Map(
    productRecords
      .filter((product) => !product.sourceItemId)
      .map((product) => [normalizeMenuName(product.name), product]),
  );

  const mergedBase = baseMenu.flatMap((item) => {
    const override = overridesBySource.get(toGuestMenuSourceItemId(item.id))
      ?? overridesByName.get(normalizeMenuName(item.name));

    if (!override) {
      return item.isAvailable === false ? [] : [item];
    }

    remainingProducts.delete(override.id);
    if (override.isAvailable === false) {
      return [];
    }

    return [{
      ...item,
      name: override.name || item.name,
      description: override.description || item.description,
      price: override.price,
      category: override.category || item.category,
      image: override.image || item.image,
      tag: override.tag || override.serviceTag || item.tag,
      allergens: override.allergens?.trim() || item.allergens,
      dietaryTags: override.dietaryTags?.length ? override.dietaryTags : item.dietaryTags,
      spiceLevel: override.spiceLevel || item.spiceLevel,
      serviceTag: override.serviceTag || item.serviceTag,
      isAvailable: true,
      unavailableReason: override.unavailableReason || item.unavailableReason,
      timeSlots: override.timeSlots?.length ? override.timeSlots : item.timeSlots,
    }];
  });

  const customItems = Array.from(remainingProducts.values())
    .filter((product) => product.isAvailable !== false)
    .sort((left, right) => (
      left.category.localeCompare(right.category) || left.name.localeCompare(right.name)
    ))
    .map(toCustomGuestMenuItem);

  return [...mergedBase, ...customItems];
}
