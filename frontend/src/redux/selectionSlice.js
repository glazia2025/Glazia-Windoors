import { createSlice } from '@reduxjs/toolkit';

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

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
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
          return;
        } else {
          state.productsByOption[option] = [
            ...state.productsByOption[option],
            product
          ];
        }
      }
    },
    clearProduct: (state, action) => {
      const { option, sapCode } = action.payload;

      console.log(
        "Clearing product from option:",
        option,
        "SapCode:",
        sapCode,
        state.selectedOption,
        state.productsByOption[option]
      );

      if (state.productsByOption[option]) {
        state.productsByOption[option] = state.productsByOption[option].filter(
          (item) => item.sapCode !== sapCode
        );
      }
    },
    clearSelectedProducts: (state, action) => {
      const { option } = action.payload;
      state.productsByOption[option] = [];
    },
    updateProductQuantity: (state, action) => {
      const { option, sapCode, quantity } = action.payload;
      if (state.productsByOption[option]) {
        const productIndex = state.productsByOption[option].findIndex(
          (product) => product.sapCode === sapCode
        );

        if (productIndex !== -1) {
          const product = state.productsByOption[option][productIndex];
          state.productsByOption[option][productIndex] = {
            ...product,
            quantity,
            amount: (Number(product.rate) * quantity).toFixed(2),
          };
        }
      }
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
  setActiveProfile,
  setActiveOption
} = selectionSlice.actions;

export default selectionSlice.reducer;
