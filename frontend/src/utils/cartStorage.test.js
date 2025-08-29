import {
  saveCartToStorage,
  loadCartFromStorage,
  clearCartFromStorage,
  hasCartItems,
  getCartItemsCount,
  mergeCartData
} from './cartStorage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

describe('Cart Storage Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log
    console.error = jest.fn(); // Mock console.error
    console.warn = jest.fn(); // Mock console.warn
  });

  describe('saveCartToStorage', () => {
    test('saves cart data to localStorage', () => {
      const cartData = {
        productsByOption: {
          profile: [{ sapCode: 'TEST001', quantity: 2 }],
          hardware: [],
          accessories: [],
        },
        selectedOption: 'profile',
      };

      saveCartToStorage(cartData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'glazia_cart_data',
        expect.stringContaining('TEST001')
      );
    });

    test('handles localStorage errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const cartData = { productsByOption: {} };
      
      expect(() => saveCartToStorage(cartData)).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadCartFromStorage', () => {
    test('loads valid cart data from localStorage', () => {
      const savedData = {
        productsByOption: {
          profile: [{ sapCode: 'TEST001', quantity: 2 }],
          hardware: [],
          accessories: [],
        },
        selectedOption: 'profile',
        timestamp: Date.now(),
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(savedData));

      const result = loadCartFromStorage();

      expect(result).toEqual(savedData);
      expect(localStorage.getItem).toHaveBeenCalledWith('glazia_cart_data');
    });

    test('returns null when no data exists', () => {
      localStorage.getItem.mockReturnValue(null);

      const result = loadCartFromStorage();

      expect(result).toBeNull();
    });

    test('returns null for invalid JSON', () => {
      localStorage.getItem.mockReturnValue('invalid json');

      const result = loadCartFromStorage();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    test('clears old data and returns null', () => {
      const oldData = {
        productsByOption: { profile: [], hardware: [], accessories: [] },
        timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days old
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(oldData));

      const result = loadCartFromStorage();

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('glazia_cart_data');
    });
  });

  describe('clearCartFromStorage', () => {
    test('removes cart data from localStorage', () => {
      clearCartFromStorage();

      expect(localStorage.removeItem).toHaveBeenCalledWith('glazia_cart_data');
    });
  });

  describe('hasCartItems', () => {
    test('returns true when cart has items', () => {
      const cartData = {
        productsByOption: {
          profile: [{ sapCode: 'TEST001' }],
          hardware: [],
          accessories: [],
        },
      };

      expect(hasCartItems(cartData)).toBe(true);
    });

    test('returns false when cart is empty', () => {
      const cartData = {
        productsByOption: {
          profile: [],
          hardware: [],
          accessories: [],
        },
      };

      expect(hasCartItems(cartData)).toBe(false);
    });

    test('returns false for invalid data', () => {
      expect(hasCartItems(null)).toBe(false);
      expect(hasCartItems({})).toBe(false);
    });
  });

  describe('getCartItemsCount', () => {
    test('returns correct count of items', () => {
      const cartData = {
        productsByOption: {
          profile: [{ sapCode: 'TEST001' }, { sapCode: 'TEST002' }],
          hardware: [{ sapCode: 'HW001' }],
          accessories: [],
        },
      };

      expect(getCartItemsCount(cartData)).toBe(3);
    });

    test('returns 0 for empty cart', () => {
      const cartData = {
        productsByOption: {
          profile: [],
          hardware: [],
          accessories: [],
        },
      };

      expect(getCartItemsCount(cartData)).toBe(0);
    });
  });

  describe('mergeCartData', () => {
    test('merges saved data with current state', () => {
      const currentState = {
        selectedOption: 'hardware',
        productsByOption: {
          profile: [],
          hardware: [],
          accessories: [],
        },
      };

      const savedData = {
        selectedOption: 'profile',
        productsByOption: {
          profile: [{ sapCode: 'TEST001' }],
          hardware: [],
          accessories: [],
        },
      };

      const result = mergeCartData(currentState, savedData);

      expect(result.selectedOption).toBe('profile');
      expect(result.productsByOption.profile).toHaveLength(1);
    });

    test('returns current state when no saved data', () => {
      const currentState = {
        selectedOption: 'profile',
        productsByOption: {
          profile: [],
          hardware: [],
          accessories: [],
        },
      };

      const result = mergeCartData(currentState, null);

      expect(result).toBe(currentState);
    });
  });
});
