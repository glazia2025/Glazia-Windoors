import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    profileHeirarchy: [],
    hardwareHeirarchy: [],
};

const heirarchySlice = createSlice({
  name: "heirarchy",
  initialState,
  reducers: {
    setProfileHeirarchy: (state, action) => {
      state.profileHeirarchy = action.payload;
    },
    setHardwareHeirarchy: (state, action) => {
      state.hardwareHeirarchy = action.payload;
    },
  },
});

export const {
  setProfileHeirarchy,
  setHardwareHeirarchy,
} = heirarchySlice.actions;

export default heirarchySlice.reducer;
