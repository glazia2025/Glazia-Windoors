import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import loaderReducer from './loadingSlice';
import selectionReducer from './selectionSlice';

const store = configureStore({
  reducer: {
    user: userReducer, // Adding user reducer
    loader: loaderReducer,
    selection: selectionReducer
  },
});

export default store;
