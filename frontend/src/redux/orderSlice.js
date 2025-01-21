// src/redux/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Async action to fetch orders
export const fetchOrders = createAsyncThunk(
    "orders/fetchOrders",
    async (_, thunkAPI) => {
      try {
        const token = localStorage.getItem("authToken");
  
        const response = await api.get("https://api.glazia.in/api/admin/getOrders", {
          headers: { Authorization: `Bearer ${token}` },
          signal: thunkAPI.signal, // Allows request cancellation
        });
  
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
