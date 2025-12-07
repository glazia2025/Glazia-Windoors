import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import store from "../redux/store";
import { startLoading, stopLoading } from "../redux/loadingSlice";

export const BASE_API_URL = "http://localhost:5000/api";
// export const BASE_API_URL = "https://api.glazia.in/api";

export const buildQueryParams = (params) => {
  let queryStr;

  if (!!params && Object.keys(params).length) {
    queryStr = new URLSearchParams(params).toString();
  }

  return queryStr?.length ? "?" + queryStr : "";
};

let activeRequests = 0; // Counter to track active requests

const api = axios.create({
  baseURL: BASE_API_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    activeRequests += 1; // Increment active requests
    if (activeRequests === 1) {
      store.dispatch(startLoading()); // Start loading only for the first request
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    activeRequests -= 1; // Decrement active requests
    if (activeRequests === 0) {
      store.dispatch(stopLoading()); // Stop loading when all requests complete
    }
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    activeRequests -= 1; // Decrement active requests on error
    if (activeRequests === 0) {
      store.dispatch(stopLoading()); // Stop loading when all requests complete
    }
    const errorMessage = error.response?.data?.message || "An error occurred.";
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
