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
import UserLoginForm from "./components/UserLoginForm/UserLoginForm";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import UserOrders from "./components/UserOrders";
import { jwtDecode } from "jwt-decode";
import AdminAddProduct from "./components/AdminAddProduct";
import Header from "./components/Header/Header";
import UserProfile from "./components/UserProfile/UserProfile";
import { useSelector } from "react-redux";
import SyncLoader from "react-spinners/SyncLoader";
import Footer from "./components/Footer";
import "./App.css";
import SelectionContainer from "./components/UserDashboard/SelectionContainer";
import AdminForm from "./components/AdminDashboard/AdminForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Orders from "./components/AdminDashboard/Orders/Orders";
import ExcelDataFetcher from "./components/Excel";
import OrderDetails from "./components/OrderDetails";
import Squares from "./components/ui/Squares/Squares";
import AboutUsPage from "./components/AboutUs/AboutUs";
import ProductsServicesPage from "./components/ProductAndServices/ProductsAndServices";
import ContactUsPage from "./components/ContactUs/ContactUs";
import BlogPage from "./components/Blogs/Blogs";
import BlogDetailPage from "./components/BlogDetail/BlogDetail";
import PrivacyPolicyPage from "./components/PrivacyPolicy/PrivacyPolicy";
import QuotationAdminPage from "./components/AdminDashboard/QuotationAdmin/QuotationAdminPage";
import UserManagement from "./components/AdminDashboard/UserManagement/UserManagement";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);


  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.loader.isLoading);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const decoded = checkTokenExpiration();

    if (decoded) {
      setUserRole(decoded.role);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }

    setAuthChecked(true); //  VERY IMPORTANT
  }, []);

  const setUserRole = (role) => {
    localStorage.setItem("userRole", role);
  };

  const onLogout = () => {
    setIsLoggedIn(false);
    setIsInitialLoad(true);
    localStorage.removeItem("authToken");
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
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
          {/* Admin Login Route */}
          {!isLoggedIn && (
            <>
              <Route
                path="/admin/login"
                element={
                  <AdminLoginForm
                    setUserRole={setUserRole}
                    setIsLoggedIn={setIsLoggedIn}
                  />
                }
              />
              <Route
                path="/"
                element={<UserLoginForm setUserRole={setUserRole} />}
              />
              <Route
                path="/about"
                element={<AboutUsPage setUserRole={setUserRole} />}
              />
              <Route
                path="/products_and_services"
                element={<ProductsServicesPage setUserRole={setUserRole} />}
              />
              <Route
                path="/blogs"
                element={<BlogPage setUserRole={setUserRole} />}
              />
              <Route
                path="/blogs/:id"
                element={<BlogDetailPage setUserRole={setUserRole} />}
              />
              <Route
                path="/contact"
                element={<ContactUsPage setUserRole={setUserRole} />}
              />
              <Route
                path="/privacy-policy"
                element={<PrivacyPolicyPage setUserRole={setUserRole} />}
              />
            </>
          )}

          {/* Admin Dashboard (protected by role check) */}
          <Route
            path="/admin/dashboard"
            element={
              localStorage.getItem("userRole") === "admin" && isLoggedIn ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          ></Route>
          <Route
            path="/admin/dashboard/add-product"
            element={
              localStorage.getItem("userRole") === "admin" && isLoggedIn ? (
                <ExcelDataFetcher />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin/dashboard/orders"
            element={
              localStorage.getItem("userRole") === "admin" && isLoggedIn ? (
                <UserOrders />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/admin/dashboard/quotations"
            element={
              localStorage.getItem("userRole") === "admin" && isLoggedIn ? (
                <QuotationAdminPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin/dashboard/users"
            element={
              localStorage.getItem("userRole") === "admin" && isLoggedIn ? (
                <UserManagement />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/admin/dashboard/orders/:orderId"
            element={
              localStorage.getItem("userRole") === "admin" && isLoggedIn ? (
                <OrderDetails />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* User Home page (accessible by regular user only) */}
          <Route
            path="/user/home"
            element={
              localStorage.getItem("userRole") === "user" && isLoggedIn ? (
                <SelectionContainer isSliderOpen={isSliderOpen} setIsSliderOpen={setIsSliderOpen} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/user/orders"
            element={
              localStorage.getItem("userRole") === "user" && isLoggedIn ? (
                <UserOrders />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/user/orders/:orderId"
            element={
              localStorage.getItem("userRole") === "user" && isLoggedIn ? (
                <OrderDetails />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/profile"
            element={
              localStorage.getItem("userRole") === "user" && isLoggedIn ? (
                <UserProfile />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
      {location.pathname !== "/" && <Footer />}
    </div>
  );
}

export default App;
