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
      const { option, products } = action.payload;
      state.productsByOption[option] = [
        ...products,
      ];
    },
    clearSelectedProducts: (state, action) => {
      const { option } = action.payload;
      state.productsByOption[option] = [];
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
  clearSelectedProducts,
  setActiveProfile,
  setActiveOption
} = selectionSlice.actions;

export default selectionSlice.reducer;
