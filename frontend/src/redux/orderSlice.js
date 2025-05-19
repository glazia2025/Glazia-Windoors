// src/redux/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { BASE_API_URL, buildQueryParams } from "../utils/api";

// Async action to fetch orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params, thunkAPI) => {
    console.log("params", params);
    try {
      const token = localStorage.getItem("authToken");

      const response = await api.get(
        `${BASE_API_URL}/user/getOrders${buildQueryParams(params)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: thunkAPI.signal, // Allows request cancellation
        }
      );

      return response.data; // On success, return data
    } catch (error) {
      // Handle error gracefully with a custom message
      return thunkAPI.rejectWithValue("Failed to fetch orders");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
