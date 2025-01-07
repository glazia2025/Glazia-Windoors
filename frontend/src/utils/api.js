import axios from 'axios';
import store from '../redux/store';
import { startLoading, stopLoading } from '../redux/loadingSlice';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your API base URL
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    store.dispatch(startLoading());
    return config;
  },
  (error) => {
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    store.dispatch(stopLoading());
    return response;
  },
  (error) => {
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

export default api;
