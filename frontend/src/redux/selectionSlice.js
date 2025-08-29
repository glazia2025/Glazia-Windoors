import { createSlice } from '@reduxjs/toolkit';
import { loadCartFromStorage, saveCartToStorage, mergeCartData } from '../utils/cartStorage';

// Load saved cart data from localStorage
const savedCartData = loadCartFromStorage();

const initialState = {
  selectedOption: 'profile',
  activeProfile: null,
  activeOption: null,
  productsByOption: {
    profile: [],
    hardware: [],
    accessories: [],
  },
};

// Merge saved data with initial state if available
const mergedInitialState = savedCartData
  ? mergeCartData(initialState, savedCartData)
  : initialState;

const selectionSlice = createSlice({
  name: 'selection',
  initialState: mergedInitialState,
  reducers: {
    setSelectedOption: (state, action) => {
      state.selectedOption = action.payload;
    },
    addSelectedProducts: (state, action) => {
      const { option, product } = action.payload;

      console.log('Adding product to option:', option, 'Product:', product);
      console.log('Current products for option:', state.productsByOption[option]);
      console.log('Type of product:', typeof product);
      console.log('Current state:', state);
      console.log('Is product an array?', Array.isArray(product));
      if(Array.isArray(product)) {
        state.productsByOption[option] = [
          ...product
        ];
      }
      else {
        const id = state.productsByOption[option].findIndex(data => {
          return data.sapCode === product.sapCode;
        })
        console.log('Product index in option:', id);
        console.log('Product found:', state.productsByOption[option][id]);
        if (id !== -1) {
          state.productsByOption[option][id] = product;
        } else {
          state.productsByOption[option] = [
            ...state.productsByOption[option],
            product
          ];
        }
      }
      // Save to localStorage after updating
      saveCartToStorage(state);
    },
    clearProduct: (state, action) => {
      const {option, sapCode} = action.payload;
      state.productsByOption[option] = state.productsByOption[option].filter(item => item.sapCode !== sapCode);
      // Save to localStorage after updating
      saveCartToStorage(state);
    },
    clearSelectedProducts: (state, action) => {
      const { option } = action.payload;
      state.productsByOption[option] = [];
      // Save to localStorage after updating
      saveCartToStorage(state);
    },
    updateProductQuantity: (state, action) => {
      const { option, sapCode, quantity } = action.payload;
      const productIndex = state.productsByOption[option].findIndex(
        product => product.sapCode === sapCode
      );

      if (productIndex !== -1) {
        const product = state.productsByOption[option][productIndex];
        state.productsByOption[option][productIndex] = {
          ...product,
          quantity: quantity,
          amount: (product.rate * quantity).toFixed(2)
        };
        // Save to localStorage after updating
        saveCartToStorage(state);
      }
    },
    clearAllCartData: (state) => {
      state.productsByOption = {
        profile: [],
        hardware: [],
        accessories: [],
      };
      // Save to localStorage after clearing
      saveCartToStorage(state);
    },
    setActiveProfile: (state, action) => {
      state.activeProfile = action.payload;
    },
    setActiveOption: (state, action) => {
      state.activeOption = action.payload;
    },
  },
});

export const {
  setSelectedOption,
  addSelectedProducts,
  clearProduct,
  clearSelectedProducts,
  updateProductQuantity,
  clearAllCartData,
  setActiveProfile,
  setActiveOption
} = selectionSlice.actions;

export default selectionSlice.reducer;
