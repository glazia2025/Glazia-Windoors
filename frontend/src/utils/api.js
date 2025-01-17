import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from '../redux/store';
import { startLoading, stopLoading } from '../redux/loadingSlice';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    store.dispatch(startLoading());
    return config;
  },
  (error) => {
    store.dispatch(stopLoading());
    toast.error('Request failed. Please try again.');
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    store.dispatch(stopLoading());
    console.log("catchec", response.data.message);
    if (response.data?.message) {
    console.log("catchec 2");
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    store.dispatch(stopLoading());
    const errorMessage = error.response?.data?.message || 'An error occurred.';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
