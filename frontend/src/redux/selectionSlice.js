import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedOption: 'profile',
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
      const { option, products } = action.payload;
      state.productsByOption[option] = [
        ...products,
      ];
    },
    clearSelectedProducts: (state, action) => {
      const { option } = action.payload;
      state.productsByOption[option] = [];
    },
  },
});

export const {
  setSelectedOption,
  addSelectedProducts,
  clearSelectedProducts,
} = selectionSlice.actions;

export default selectionSlice.reducer;
