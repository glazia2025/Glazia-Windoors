// Cart Local Storage Utilities

const CART_STORAGE_KEY = 'glazia_cart_data';

/**
 * Save cart data to localStorage
 * @param {Object} cartData - The cart data to save
 */
export const saveCartToStorage = (cartData) => {
  try {
    const dataToSave = {
      productsByOption: cartData.productsByOption,
      selectedOption: cartData.selectedOption,
      timestamp: Date.now(), // Add timestamp for cache invalidation if needed
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToSave));
    console.log('Cart data saved to localStorage:', dataToSave);
  } catch (error) {
    console.error('Error saving cart data to localStorage:', error);
  }
};

/**
 * Load cart data from localStorage
 * @returns {Object|null} - The cart data or null if not found/invalid
 */
export const loadCartFromStorage = () => {
  try {
    const savedData = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedData) {
      return null;
    }

    const parsedData = JSON.parse(savedData);
    
    // Validate the structure
    if (!parsedData.productsByOption || typeof parsedData.productsByOption !== 'object') {
      console.warn('Invalid cart data structure in localStorage');
      return null;
    }

    // Check if data is not too old (optional - 7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (parsedData.timestamp && (Date.now() - parsedData.timestamp > maxAge)) {
      console.log('Cart data is too old, clearing it');
      clearCartFromStorage();
      return null;
    }

    console.log('Cart data loaded from localStorage:', parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error loading cart data from localStorage:', error);
    return null;
  }
};

/**
 * Clear cart data from localStorage
 */
export const clearCartFromStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    console.log('Cart data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing cart data from localStorage:', error);
  }
};

/**
 * Check if cart has any items
 * @param {Object} cartData - The cart data to check
 * @returns {boolean} - True if cart has items
 */
export const hasCartItems = (cartData) => {
  if (!cartData || !cartData.productsByOption) {
    return false;
  }

  const { profile = [], hardware = [], accessories = [] } = cartData.productsByOption;
  return profile.length > 0 || hardware.length > 0 || accessories.length > 0;
};

/**
 * Get total items count in cart
 * @param {Object} cartData - The cart data to count
 * @returns {number} - Total number of items
 */
export const getCartItemsCount = (cartData) => {
  if (!cartData || !cartData.productsByOption) {
    return 0;
  }

  const { profile = [], hardware = [], accessories = [] } = cartData.productsByOption;
  return profile.length + hardware.length + accessories.length;
};

/**
 * Merge saved cart data with current state
 * @param {Object} currentState - Current Redux state
 * @param {Object} savedData - Saved cart data from localStorage
 * @returns {Object} - Merged state
 */
export const mergeCartData = (currentState, savedData) => {
  if (!savedData || !savedData.productsByOption) {
    return currentState;
  }

  return {
    ...currentState,
    productsByOption: {
      profile: savedData.productsByOption.profile || [],
      hardware: savedData.productsByOption.hardware || [],
      accessories: savedData.productsByOption.accessories || [],
    },
    selectedOption: savedData.selectedOption || currentState.selectedOption,
  };
};
