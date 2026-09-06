import React, { useEffect, useState } from "react";
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AdminLoginForm from "./components/AdminLoginForm/AdminLoginForm";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import UserOrders from "./components/UserOrders";
import { jwtDecode } from "jwt-decode";
import DashboardLayout from "./components/layout/DashboardLayout";
import { useSelector } from "react-redux";
import SyncLoader from "react-spinners/SyncLoader";
import Footer from "./components/Footer";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderDetails from "./components/OrderDetails";
import QuotationAdminPage from "./components/AdminDashboard/QuotationAdmin/QuotationAdminPage";
import UserManagement from "./components/AdminDashboard/UserManagement/UserManagement";
import BlogManagement from "./components/AdminDashboard/BlogManagement/BlogManagement";
import StockApprovals from "./components/AdminDashboard/StockApprovals/StockApprovals";
import Inventory from "./components/AdminDashboard/Inventory/Inventory";
import AdminAccounts from "./components/AdminDashboard/AdminAccounts/AdminAccounts";
import UserListing from "./components/AdminDashboard/UserListing/UserListing";
import LeadManagement from "./components/AdminDashboard/LeadManagement/LeadManagement";
import { clearCurrentAdminPermissions, firstAllowedAdminPath, hasAdminAccess, setCurrentAdminPermissions } from "./utils/adminAccess";
import api, { BASE_API_URL } from "./utils/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [, setPermissionVersion] = useState(0);

  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.loader.isLoading);
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      const decoded = checkTokenExpiration();
      if (decoded?.role === "admin") {
        try {
          const response = await api.get(`${BASE_API_URL}/auth/admin/session`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
          setCurrentAdminPermissions(response.data.admin?.permissions || []);
          setUserRole(decoded.role); setIsLoggedIn(true);
        } catch (_error) {
          localStorage.removeItem("authToken"); localStorage.removeItem("userRole"); clearCurrentAdminPermissions(); setIsLoggedIn(false);
        }
      } else {
        clearCurrentAdminPermissions(); setIsLoggedIn(false); setUserRole(null);
      }
      setAuthChecked(true);
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    const refreshPermissions = () => setPermissionVersion((value) => value + 1);
    window.addEventListener("admin-permissions-changed", refreshPermissions);
    return () => window.removeEventListener("admin-permissions-changed", refreshPermissions);
  }, []);

  const setUserRole = (role) => {
    localStorage.setItem("userRole", role);
  };

  const onLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    clearCurrentAdminPermissions();
    navigate("/login");
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        const isLegacyAdminToken = decoded.role === "admin" && !Array.isArray(decoded.permissions);
        if (decoded.exp < currentTime || isLegacyAdminToken) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
        } else {
          return decoded;
        }
      } catch (error) {
        console.error("Error decoding token", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
      }
    }
  };

  if (!authChecked) {
    return null;
  }

  const authenticated = isLoggedIn && Boolean(localStorage.getItem("userRole"));

  const adminRoute = (permission, element) => {
    const isAllowed = Array.isArray(permission)
      ? permission.some((p) => hasAdminAccess(p))
      : hasAdminAccess(permission);
    return localStorage.getItem("userRole") === "admin" && isLoggedIn && isAllowed
      ? element
      : <Navigate to={isLoggedIn ? firstAllowedAdminPath() : "/login"} replace />;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-page-bg, #f8fafc)" }}>
      <ToastContainer
        style={{ marginTop: "70px" }}
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <SyncLoader color="#1e293b" />
        </div>
      )}

      {authenticated ? (
        <DashboardLayout onLogout={onLogout}>
          <div className="app-container position-relative">
            <Routes>
              <Route
                path="/"
                element={
                  localStorage.getItem("userRole") === "admin" ? (
                    <Navigate to={firstAllowedAdminPath()} replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  <Navigate
                    to={localStorage.getItem("userRole") === "admin" ? firstAllowedAdminPath() : "/dashboard"}
                    replace
                  />
                }
              />
              <Route
                path="/dashboard"
                element={adminRoute("DASHBOARD", <AdminDashboard />)}
              />
              <Route
                path="/dashboard/orders"
                element={adminRoute("ORDERS", <UserOrders />)}
              />
              <Route
                path="/dashboard/quotations"
                element={adminRoute("QUOTATIONS", <QuotationAdminPage />)}
              />
              <Route
                path="/dashboard/users"
                element={adminRoute("USERS", <UserManagement />)}
              />
              <Route
                path="/dashboard/dynamic-pricing"
                element={adminRoute(["DYNAMIC_PRICING", "USERS"], <UserListing />)}
              />
              <Route
                path="/dashboard/leads"
                element={adminRoute(["LEADS", "DASHBOARD", "USERS"], <LeadManagement />)}
              />
              <Route
                path="/dashboard/lead-management"
                element={<Navigate to="/dashboard/leads" replace />}
              />
              <Route
                path="/dashboard/blogs"
                element={adminRoute("BLOGS", <BlogManagement />)}
              />
              <Route
                path="/dashboard/stock-approvals"
                element={adminRoute("STOCK_APPROVALS", <StockApprovals />)}
              />
              <Route
                path="/dashboard/inventory"
                element={adminRoute("INVENTORY", <Inventory />)}
              />
              <Route
                path="/dashboard/admin-accounts"
                element={adminRoute("ADMIN_ACCOUNTS", <AdminAccounts />)}
              />
              <Route
                path="/dashboard/orders/:orderId"
                element={adminRoute("ORDERS", <OrderDetails />)}
              />
              <Route
                path="*"
                element={
                  <Navigate
                    to={localStorage.getItem("userRole") === "admin" ? firstAllowedAdminPath() : "/dashboard"}
                    replace
                  />
                }
              />
            </Routes>
          </div>
        </DashboardLayout>
      ) : (
        <div className="login-page-container">
          <Routes>
            <Route
              path="/login"
              element={
                <AdminLoginForm
                  setUserRole={setUserRole}
                  setIsLoggedIn={setIsLoggedIn}
                />
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
