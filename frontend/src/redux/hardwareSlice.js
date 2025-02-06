import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  options: null,
  products: {},
  loading: false,
  error: null,
};

const hardwareSlice = createSlice({
  name: "hardwares",
  initialState,
  reducers: {
    setHardwareOptions(state, action) {
      state.options = action.payload;
    },    
    setHardwareProducts(state, action) {
      const { option, payload } = action?.payload; // Extract properties
      state.products[option] = payload;
    },
    fetchProductsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess(state, action) {
      state.data = action.payload;
      state.loading = false;
    },
    fetchProductsFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setHardwareProducts,
  setHardwareOptions,
} = hardwareSlice.actions;

export default hardwareSlice.reducer;
