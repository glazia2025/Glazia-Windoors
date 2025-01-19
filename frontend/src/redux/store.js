import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import loaderReducer from './loadingSlice';
import selectionReducer from './selectionSlice';
import ordersReducer from "./orderSlice";
import profileReducer from './profileSlice';
import hardwareReducer from './hardwareSlice';
import heirarchyReducer from './heirarchySlice';

const store = configureStore({
  reducer: {
    user: userReducer, // Adding user reducer
    loader: loaderReducer,
    selection: selectionReducer,
    orders: ordersReducer,
    profiles: profileReducer,
    hardwares: hardwareReducer,
    heirarchy: heirarchyReducer
  },
});

export default store;
