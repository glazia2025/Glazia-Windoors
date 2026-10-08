import { createSlice } from '@reduxjs/toolkit';

// Initial state of the user profile
const initialState = {
  user: null,
  isAuthenticated: false,
};

// Creating the slice with actions and reducers
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

// Export actions
export const { setUser, logout } = userSlice.actions;

// Export the reducer to add to the store
export default userSlice.reducer;
