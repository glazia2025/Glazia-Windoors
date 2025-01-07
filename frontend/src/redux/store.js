import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import loaderReducer from './loadingSlice';

const store = configureStore({
  reducer: {
    user: userReducer, // Adding user reducer
    loader: loaderReducer
  },
});

export default store;
