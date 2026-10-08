import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { BASE_API_URL } from "../utils/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get(`${BASE_API_URL}/admin/users`, {
        headers: getAuthHeaders(),
        signal: thunkAPI.signal,
      });

      return data.users || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load users"
      );
    }
  }
);

export const fetchUserDynamicPricing = createAsyncThunk(
  "adminUsers/fetchDynamicPricing",
  async (userId, thunkAPI) => {
    try {
      const { data } = await api.get(
        `${BASE_API_URL}/admin/get-dynamic-pricing/${userId}`,
        {
          headers: getAuthHeaders(),
          signal: thunkAPI.signal,
        }
      );

      return {
        userId,
        dynamicPricing: data.dynamicPricing || { hardware: {}, profiles: {} },
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load dynamic pricing"
      );
    }
  }
);

export const updateUserDynamicPricing = createAsyncThunk(
  "adminUsers/updateDynamicPricing",
  async ({ userId, pricing }, thunkAPI) => {
    try {
      const { data } = await api.put(
        `${BASE_API_URL}/admin/update-dynamic-pricing/${userId}`,
        pricing,
        {
          headers: getAuthHeaders(),
        }
      );

      return {
        userId,
        dynamicPricing: data.dynamicPricing || { hardware: {}, profiles: {} },
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update pricing"
      );
    }
  }
);

const initialState = {
  users: [],
  listLoading: false,
  pricingLoading: false,
  updateLoading: false,
  error: null,
  selectedUser: null,
  dynamicPricing: {
    hardware: {},
    profiles: {},
  },
};

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
      state.error = null;
    },
    clearDynamicPricing(state) {
      state.dynamicPricing = { hardware: {}, profiles: {} };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.listLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserDynamicPricing.pending, (state, action) => {
        state.pricingLoading = true;
        state.error = null;
        const userId = action.meta.arg;
        const selected = state.users.find((user) => user._id === userId);
        if (selected) {
          state.selectedUser = selected;
        }
      })
      .addCase(fetchUserDynamicPricing.fulfilled, (state, action) => {
        state.pricingLoading = false;
        state.dynamicPricing = action.payload.dynamicPricing;
      })
      .addCase(fetchUserDynamicPricing.rejected, (state, action) => {
        state.pricingLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserDynamicPricing.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUserDynamicPricing.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.dynamicPricing = action.payload.dynamicPricing;
        // keep user list in sync
        state.users = state.users.map((user) =>
          user._id === action.payload.userId
            ? { ...user, dynamicPricing: action.payload.dynamicPricing }
            : user
        );
        if (state.selectedUser && state.selectedUser._id === action.payload.userId) {
          state.selectedUser = {
            ...state.selectedUser,
            dynamicPricing: action.payload.dynamicPricing,
          };
        }
      })
      .addCase(updateUserDynamicPricing.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedUser, clearDynamicPricing } = adminUsersSlice.actions;

export default adminUsersSlice.reducer;
