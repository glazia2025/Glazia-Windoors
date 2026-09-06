import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AdminLoginForm from "./components/AdminLoginForm/AdminLoginForm";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import UserOrders from "./components/UserOrders";
import { jwtDecode } from "jwt-decode";
import AdminAddProduct from "./components/AdminAddProduct";
import Header from "./components/Header/Header";
import { useSelector } from "react-redux";
import SyncLoader from "react-spinners/SyncLoader";
import Footer from "./components/Footer";
import "./App.css";
// import SelectionContainer from "./components/UserDashboard/SelectionContainer";
import AdminForm from "./components/AdminDashboard/AdminForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Orders from "./components/AdminDashboard/Orders/Orders";
import ExcelDataFetcher from "./components/Excel";
import OrderDetails from "./components/OrderDetails";
import Squares from "./components/ui/Squares/Squares";
import QuotationAdminPage from "./components/AdminDashboard/QuotationAdmin/QuotationAdminPage";
import UserManagement from "./components/AdminDashboard/UserManagement/UserManagement";
import BlogManagement from "./components/AdminDashboard/BlogManagement/BlogManagement";
import StockApprovals from "./components/AdminDashboard/StockApprovals/StockApprovals";
import Inventory from "./components/AdminDashboard/Inventory/Inventory";
import AdminAccounts from "./components/AdminDashboard/AdminAccounts/AdminAccounts";
import { clearCurrentAdminPermissions, firstAllowedAdminPath, hasAdminAccess, setCurrentAdminPermissions } from "./utils/adminAccess";
import api, { BASE_API_URL } from "./utils/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [, setPermissionVersion] = useState(0);


  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.loader.isLoading);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
    const refreshPermissions = () => setPermissionVersion(value => value + 1);
    window.addEventListener("admin-permissions-changed", refreshPermissions);
    return () => window.removeEventListener("admin-permissions-changed", refreshPermissions);
  }, []);

  const setUserRole = (role) => {
    localStorage.setItem("userRole", role);
  };

  const onLogout = () => {
    setIsLoggedIn(false);
    setIsInitialLoad(true);
    localStorage.removeItem("authToken");
    clearCurrentAdminPermissions();
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
    return null; // ya loader
  }
  const adminRoute = (permission, element) => localStorage.getItem("userRole") === "admin" && isLoggedIn && hasAdminAccess(permission) ? element : <Navigate to={isLoggedIn ? firstAllowedAdminPath() : "/login"} replace />;
  return (
    <div style={{ overflowX: "hidden", fontFamily: "Nunito Sans" }}>
      <ToastContainer
        style={{ marginTop: "100px" }}
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      <>
        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <SyncLoader color="#123abc" />
          </div>
        )}
        {/* Your app content */}
      </>
      {isLoggedIn && localStorage.getItem("userRole") && (
        <Header isLoggedIn={isLoggedIn} onLogout={onLogout} isSliderOpen={isSliderOpen} setIsSliderOpen={setIsSliderOpen} />
      )}
      <div className="app-container position-relative">
        <Routes>

          <Route
            path="/"
            element={
              isLoggedIn && localStorage.getItem("userRole") === "admin" ? (
                <Navigate to={firstAllowedAdminPath()} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={isLoggedIn && firstAllowedAdminPath() !== "/login" ? <Navigate to={firstAllowedAdminPath()} replace /> : <AdminLoginForm setUserRole={setUserRole} setIsLoggedIn={setIsLoggedIn} />}
          />

          {/* Admin Dashboard (protected by role check) */}
          <Route
            path="/dashboard"
            element={
              adminRoute("DASHBOARD", <AdminDashboard />)
            }
          ></Route>
          <Route
            path="/dashboard/add-product"
            element={
              adminRoute("PRODUCTS", <ExcelDataFetcher />)
            }
          />
          <Route
            path="/dashboard/orders"
            element={
              adminRoute("ORDERS", <UserOrders />)
            }
          />

          <Route
            path="/dashboard/quotations"
            element={
              adminRoute("QUOTATIONS", <QuotationAdminPage />)
            }
          />
          <Route
            path="/dashboard/users"
            element={
              adminRoute("USERS", <UserManagement />)
            }
          />
          <Route
            path="/dashboard/blogs"
            element={
              adminRoute("BLOGS", <BlogManagement />)
            }
          />
          <Route path="/dashboard/stock-approvals" element={adminRoute("STOCK_APPROVALS", <StockApprovals />)} />
          <Route path="/dashboard/inventory" element={adminRoute("INVENTORY", <Inventory />)} />
          <Route path="/dashboard/admin-accounts" element={adminRoute("ADMIN_ACCOUNTS", <AdminAccounts />)} />

          <Route
            path="/dashboard/orders/:orderId"
            element={
              adminRoute("ORDERS", <OrderDetails />)
            }
          />
        </Routes>
      </div>
      {location.pathname !== "/" && <Footer />}
    </div>
  );
}

export default App;
