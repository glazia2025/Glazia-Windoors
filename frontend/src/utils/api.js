import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import store from "../redux/store";
import { startLoading, stopLoading } from "../redux/loadingSlice";

 //export const BASE_API_URL = "https://api.glazia.in/api";

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");
const isLocalBrowser = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const defaultMainApiUrl = isLocalBrowser ? "http://localhost:5555" : "https://api.glazia.in";

export const MAIN_API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_MAIN_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    defaultMainApiUrl
);
export const QUOTATION_API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_QUOTATION_API_BASE_URL || "https://quotation-api.glazia.in"
);

 export const BASE_API_URL = `${MAIN_API_BASE_URL}/api`;
 export const QUOTATION_BASE_API_URL = `${QUOTATION_API_BASE_URL}/api`;
export const getApiErrorMessage = (error, action = "complete the request") => {
  const data = error?.response?.data;
  if (data && typeof data === "object" && typeof data.message === "string" && data.message.trim()) return data.message;
  if (!error?.response) {
    if (error?.code === "ECONNABORTED") return `The request timed out while trying to ${action}. Please try again.`;
    return `Could not connect to the Glazia server while trying to ${action}. Check your connection and the API URL.`;
  }
  if (typeof data === "string" && data.trim().startsWith("<")) return `The server returned a web page instead of API data while trying to ${action}. The API route may be unavailable.`;
  return `The server could not ${action} (HTTP ${error.response.status}). Please try again or contact support.`;
};
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
    const errorMessage = getApiErrorMessage(error);
    toast.error(errorMessage);
    const permissionMatch = error.response?.status === 403 && errorMessage.match(/Access denied\. ([A-Z_]+) permission is required\./);
    if (permissionMatch) {
      const token = localStorage.getItem("authToken");
      fetch(`${BASE_API_URL}/auth/admin/session`, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (!data) return;
          localStorage.setItem("adminPermissions", JSON.stringify(data.admin?.permissions || []));
          window.dispatchEvent(new Event("admin-permissions-changed"));
        })
        .catch(() => {});
    }
    return Promise.reject(error);
  }
);

export default api;
