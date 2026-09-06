import { jwtDecode } from "jwt-decode";

const PERMISSIONS_KEY = "adminPermissions";

export const setCurrentAdminPermissions = permissions => {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(Array.isArray(permissions) ? permissions : []));
  window.dispatchEvent(new Event("admin-permissions-changed"));
};

export const clearCurrentAdminPermissions = () => localStorage.removeItem(PERMISSIONS_KEY);

const storedPermissions = () => {
  try {
    const value = JSON.parse(localStorage.getItem(PERMISSIONS_KEY));
    return Array.isArray(value) ? value : null;
  } catch (_error) { return null; }
};

export const getAdminSession = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.role === "admin" ? decoded : null;
  } catch (_error) { return null; }
};

export const hasAdminAccess = permission => {
  const permissions = storedPermissions() || getAdminSession()?.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
};

export const firstAllowedAdminPath = () => {
  const routes = [["DASHBOARD", "/dashboard"], ["ORDERS", "/dashboard/orders"], ["INVENTORY", "/dashboard/inventory"], ["QUOTATIONS", "/dashboard/quotations"], ["USERS", "/dashboard/users"], ["STOCK_APPROVALS", "/dashboard/stock-approvals"], ["PRODUCTS", "/dashboard/add-product"], ["BLOGS", "/dashboard/blogs"], ["ADMIN_ACCOUNTS", "/dashboard/admin-accounts"]];
  return routes.find(([permission]) => hasAdminAccess(permission))?.[1] || "/login";
};
