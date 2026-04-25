import { getCartPairingSuggestions } from '../cartPairings';
import { MENU_ITEMS } from '../../data/constants';

describe('getCartPairingSuggestions', () => {
  it('suggests dessert and beverage complements for main-heavy carts', () => {
    const suggestions = getCartPairingSuggestions(
      [
        {
          id: 14,
          name: 'Pan-Seared Salmon',
          description: 'Norwegian salmon fillet with lemon beurre blanc.',
          price: 265000,
          category: 'Mains',
          image: '/assets/menu/mains.jpg',
          tag: '',
          allergens: 'Fish, Dairy',
          qty: 1,
          note: '',
        },
      ],
      MENU_ITEMS,
    );

    expect(suggestions.map((item) => item.name)).toEqual([
      'Chocolate Lava Cake',
      'Vanilla Bean Cheesecake',
      'Virgin Mojito',
      'Fresh Orange Juice',
    ]);
  });

  it('suggests beverages after dessert-only carts', () => {
    const suggestions = getCartPairingSuggestions(
      [
        {
          id: 21,
          name: 'Chocolate Lava Cake',
          description: 'Dark chocolate fondant with molten centre, served with vanilla bean ice cream.',
          price: 95000,
          category: 'Desserts',
          image: '/assets/menu/desserts.jpg',
          tag: 'Popular',
          allergens: 'Dairy, Egg, Wheat',
          qty: 1,
          note: '',
        },
      ],
      MENU_ITEMS,
    );

    expect(suggestions[0]).toEqual(expect.objectContaining({ name: 'Virgin Mojito', category: 'Beverages' }));
  });
});
