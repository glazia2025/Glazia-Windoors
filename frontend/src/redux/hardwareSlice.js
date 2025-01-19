import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {},
  loading: false,
  error: null,
};

const hardwareSlice = createSlice({
  name: "hardwares",
  initialState,
  reducers: {
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
} = hardwareSlice.actions;

export default hardwareSlice.reducer;
