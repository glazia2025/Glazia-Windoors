import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { BASE_API_URL } from "../../utils/api";
import {
  setHardwareHeirarchy,
  setProfileHeirarchy,
} from "../../redux/heirarchySlice";
import {
  setActiveOption,
  setActiveProfile,
  setSelectedOption,
} from "../../redux/selectionSlice";
import { firstAllowedAdminPath, hasAdminAccess } from "../../utils/adminAccess";
import "./Sidebar.css";

const Sidebar = ({ isCollapsed, onToggle, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [userRole, setUserRole] = useState(null);
  const [, setPermissionVersion] = useState(0);
  const [expandedMenus, setExpandedMenus] = useState({
    profile: false,
    hardware: false,
    orders: false,
  });
  const [activeFlyout, setActiveFlyout] = useState(null);

  const { profileHeirarchy, hardwareHeirarchy } = useSelector(
    (state) => state.heirarchy
  );
  const { activeOption, activeProfile } = useSelector(
    (state) => state.selection
  );

  useEffect(() => {
    const refreshPermissions = () => setPermissionVersion((v) => v + 1);
    window.addEventListener("admin-permissions-changed", refreshPermissions);
    return () => window.removeEventListener("admin-permissions-changed", refreshPermissions);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    if (role !== "admin" || hasAdminAccess("PRODUCTS")) {
      fetchProfileAndHardwareData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfileAndHardwareData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const [profileResponse, hardwareResponse] = await Promise.all([
        api.get(
          `${BASE_API_URL}/${
            window.location.pathname.includes("admin") ? "admin" : "user"
          }/get-profile-heirarchy`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        api.get(`${BASE_API_URL}/user/get-hardware-heirarchy`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      dispatch(setProfileHeirarchy(profileResponse.data.products || []));
      dispatch(setHardwareHeirarchy(hardwareResponse.data.products || []));
    } catch (err) {
      console.error("Sidebar hierarchy fetch error:", err);
    }
  };

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const handleProfileSelect = (mainCategory, subCategory) => {
    dispatch(setActiveProfile(mainCategory));
    dispatch(setActiveOption(subCategory));
    dispatch(setSelectedOption("profile"));
    navigate("/dashboard");
    setActiveFlyout(null);
  };

  const handleHardwareSelect = (hardware) => {
    dispatch(setActiveProfile(undefined));
    dispatch(setActiveOption(hardware));
    dispatch(setSelectedOption("hardware"));
    navigate("/dashboard");
    setActiveFlyout(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setActiveFlyout(null);
  };

  const isActive = (path, queryKey, queryValue) => {
    if (queryKey && queryValue) {
      const params = new URLSearchParams(location.search);
      return location.pathname === path && params.get(queryKey) === queryValue;
    }
    return location.pathname === path;
  };

  const isProfileActive =
    location.pathname === "/dashboard" && activeProfile !== null && activeProfile !== undefined;
  const isHardwareActive =
    location.pathname === "/dashboard" && activeProfile === undefined && activeOption !== null;

  return (
    <aside
      className={`glazia-sidebar ${isCollapsed ? "collapsed" : ""}`}
      onMouseLeave={() => isCollapsed && setActiveFlyout(null)}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div
          className="brand-container cursor-pointer"
          onClick={() => handleNavigation(userRole === "admin" ? firstAllowedAdminPath() : "/dashboard")}
          title="Glazia Dashboard"
        >
          <img src="/123.png" alt="Glazia" className="sidebar-brand-logo" />
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar"
        >
          <i
            className={`fas ${
              isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
            }`}
          />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="nav-group-label">{!isCollapsed ? "Main Navigation" : "•••"}</div>

        {/* Dashboard */}
        {(userRole !== "admin" || hasAdminAccess("DASHBOARD")) && (
          <div
            className={`nav-item ${
              isActive("/dashboard") && !isProfileActive && !isHardwareActive
                ? "active"
                : ""
            }`}
            onClick={() => handleNavigation("/dashboard")}
            title="Dashboard"
          >
            <div className="nav-item-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
              </svg>
            </div>
            {!isCollapsed && <span className="nav-item-label">Dashboard</span>}
          </div>
        )}

        {/* Profile Dropdown */}
        {(userRole !== "admin" || hasAdminAccess("PRODUCTS")) && (
          <div
            className={`nav-item nav-item-has-submenu ${
              isProfileActive ? "active-parent" : ""
            }`}
            onMouseEnter={() => isCollapsed && setActiveFlyout("profile")}
          >
            <div
              className="nav-item-header"
              onClick={() => {
                if (isCollapsed) {
                  setActiveFlyout(activeFlyout === "profile" ? null : "profile");
                } else {
                  toggleSubmenu("profile");
                }
              }}
              title="Profile"
            >
              <div className="nav-item-icon">
                <i className="fas fa-window-restore" />
              </div>
              {!isCollapsed && (
                <>
                  <span className="nav-item-label">Profile</span>
                  <i
                    className={`fas fa-chevron-down submenu-arrow ${
                      expandedMenus.profile ? "rotated" : ""
                    }`}
                  />
                </>
              )}
            </div>

            {/* Expanded Submenu in Normal Mode */}
            {!isCollapsed && expandedMenus.profile && (
              <div className="sidebar-submenu">
                {profileHeirarchy && profileHeirarchy.length > 0 ? (
                  profileHeirarchy.map((cat) => (
                    <div key={cat.profile} className="profile-category-group">
                      <div className="profile-category-title">{cat.profile}</div>
                      {cat.options?.map((sub) => (
                        <div
                          key={sub}
                          className={`submenu-item ${
                            activeProfile === cat.profile && activeOption === sub
                              ? "active"
                              : ""
                          }`}
                          onClick={() => handleProfileSelect(cat.profile, sub)}
                        >
                          <i className="fas fa-circle submenu-bullet" />
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="submenu-empty">Loading profiles...</div>
                )}
              </div>
            )}

            {/* Floating Submenu in Collapsed Mode */}
            {isCollapsed && activeFlyout === "profile" && (
              <div className="sidebar-flyout-menu">
                <div className="flyout-header">Profile Systems</div>
                {profileHeirarchy?.map((cat) => (
                  <div key={cat.profile} className="flyout-group">
                    <div className="flyout-group-title">{cat.profile}</div>
                    {cat.options?.map((sub) => (
                      <div
                        key={sub}
                        className={`flyout-item ${
                          activeProfile === cat.profile && activeOption === sub
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleProfileSelect(cat.profile, sub)}
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hardware Dropdown */}
        {(userRole !== "admin" || hasAdminAccess("PRODUCTS")) && (
          <div
            className={`nav-item nav-item-has-submenu ${
              isHardwareActive ? "active-parent" : ""
            }`}
            onMouseEnter={() => isCollapsed && setActiveFlyout("hardware")}
          >
            <div
              className="nav-item-header"
              onClick={() => {
                if (isCollapsed) {
                  setActiveFlyout(activeFlyout === "hardware" ? null : "hardware");
                } else {
                  toggleSubmenu("hardware");
                }
              }}
              title="Hardware"
            >
              <div className="nav-item-icon">
                <i className="fas fa-tools" />
              </div>
              {!isCollapsed && (
                <>
                  <span className="nav-item-label">Hardware</span>
                  <i
                    className={`fas fa-chevron-down submenu-arrow ${
                      expandedMenus.hardware ? "rotated" : ""
                    }`}
                  />
                </>
              )}
            </div>

            {/* Expanded Submenu */}
            {!isCollapsed && expandedMenus.hardware && (
              <div className="sidebar-submenu">
                {hardwareHeirarchy && hardwareHeirarchy.length > 0 ? (
                  hardwareHeirarchy.map((hardware) => (
                    <div
                      key={hardware}
                      className={`submenu-item ${
                        activeOption === hardware ? "active" : ""
                      }`}
                      onClick={() => handleHardwareSelect(hardware)}
                    >
                      <i className="fas fa-circle submenu-bullet" />
                      <span>{hardware}</span>
                    </div>
                  ))
                ) : (
                  <div className="submenu-empty">Loading hardware...</div>
                )}
              </div>
            )}

            {/* Flyout in Collapsed Mode */}
            {isCollapsed && activeFlyout === "hardware" && (
              <div className="sidebar-flyout-menu">
                <div className="flyout-header">Hardware Categories</div>
                {hardwareHeirarchy?.map((hardware) => (
                  <div
                    key={hardware}
                    className={`flyout-item ${
                      activeOption === hardware ? "active" : ""
                    }`}
                    onClick={() => handleHardwareSelect(hardware)}
                  >
                    {hardware}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {(userRole !== "admin" || hasAdminAccess("ORDERS")) && (
          <div
            className={`nav-item nav-item-has-submenu ${
              location.pathname.startsWith("/dashboard/orders")
                ? "active-parent"
                : ""
            }`}
            onMouseEnter={() => isCollapsed && setActiveFlyout("orders")}
          >
            <div
              className="nav-item-header"
              onClick={() => {
                if (isCollapsed) {
                  setActiveFlyout(activeFlyout === "orders" ? null : "orders");
                } else {
                  toggleSubmenu("orders");
                }
              }}
              title="Orders"
            >
              <div className="nav-item-icon">
                <i className="fas fa-shopping-bag" />
              </div>
              {!isCollapsed && (
                <>
                  <span className="nav-item-label">Orders</span>
                  <i
                    className={`fas fa-chevron-down submenu-arrow ${
                      expandedMenus.orders ? "rotated" : ""
                    }`}
                  />
                </>
              )}
            </div>

            {/* Orders Submenu */}
            {!isCollapsed && expandedMenus.orders && (
              <div className="sidebar-submenu">
                <div
                  className={`submenu-item ${
                    isActive("/dashboard/orders", "status", "ongoing")
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleNavigation("/dashboard/orders?status=ongoing")}
                >
                  <i className="fas fa-clock submenu-bullet" />
                  <span>Ongoing Orders</span>
                </div>
                <div
                  className={`submenu-item ${
                    isActive("/dashboard/orders", "status", "completed")
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation("/dashboard/orders?status=completed")
                  }
                >
                  <i className="fas fa-check-circle submenu-bullet" />
                  <span>Completed Orders</span>
                </div>
                <div
                  className={`submenu-item ${
                    isActive("/dashboard/orders", "status", "all") ||
                    (location.pathname === "/dashboard/orders" &&
                      !location.search)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleNavigation("/dashboard/orders?status=all")}
                >
                  <i className="fas fa-list-ul submenu-bullet" />
                  <span>All Orders</span>
                </div>
              </div>
            )}

            {/* Orders Flyout */}
            {isCollapsed && activeFlyout === "orders" && (
              <div className="sidebar-flyout-menu">
                <div className="flyout-header">Orders Management</div>
                <div
                  className="flyout-item"
                  onClick={() => handleNavigation("/dashboard/orders?status=ongoing")}
                >
                  Ongoing Orders
                </div>
                <div
                  className="flyout-item"
                  onClick={() =>
                    handleNavigation("/dashboard/orders?status=completed")
                  }
                >
                  Completed Orders
                </div>
                <div
                  className="flyout-item"
                  onClick={() => handleNavigation("/dashboard/orders?status=all")}
                >
                  All Orders
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN ONLY SECTION */}
        {userRole === "admin" && (
          <>
            {(hasAdminAccess("STOCK_APPROVALS") ||
              hasAdminAccess("INVENTORY") ||
              hasAdminAccess("QUOTATIONS") ||
              hasAdminAccess("USERS") ||
              hasAdminAccess("DYNAMIC_PRICING") ||
              hasAdminAccess("LEADS") ||
              hasAdminAccess("BLOGS") ||
              hasAdminAccess("ADMIN_ACCOUNTS")) && (
              <div className="nav-group-label mt-3">
                {!isCollapsed ? "Administration" : "•••"}
              </div>
            )}

            {/* Stock Approvals */}
            {hasAdminAccess("STOCK_APPROVALS") && (
              <div
                className={`nav-item ${
                  isActive("/dashboard/stock-approvals") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/dashboard/stock-approvals")}
                title="Stock Approvals"
              >
                <div className="nav-item-icon">
                  <i className="fas fa-clipboard-check" />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-label">Stock Approvals</span>
                )}
              </div>
            )}

            {/* Inventory */}
            {hasAdminAccess("INVENTORY") && (
              <div
                className={`nav-item ${
                  isActive("/dashboard/inventory") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/dashboard/inventory")}
                title="Inventory"
              >
                <div className="nav-item-icon">
                  <i className="fas fa-boxes" />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-label">Inventory</span>
                )}
              </div>
            )}

            {/* Quotations */}
            {hasAdminAccess("QUOTATIONS") && (
              <div
                className={`nav-item ${
                  isActive("/dashboard/quotations") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/dashboard/quotations")}
                title="Quotations"
              >
                <div className="nav-item-icon">
                  <i className="fas fa-file-invoice-dollar" />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-label">Quotations</span>
                )}
              </div>
            )}

            {/* Users */}
            {hasAdminAccess("USERS") && (
              <div
                className={`nav-item ${
                  isActive("/dashboard/users") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/dashboard/users")}
                title="User Management"
              >
                <div className="nav-item-icon">
                  <i className="fas fa-users" />
                </div>
                {!isCollapsed && <span className="nav-item-label">Users</span>}
              </div>
            )}

            {/* Manage User Dynamic Pricing */}
            {(hasAdminAccess("DYNAMIC_PRICING") || hasAdminAccess("USERS")) && (
              <div
                className={`nav-item ${
                  isActive("/dashboard/dynamic-pricing") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/dashboard/dynamic-pricing")}
                title="Manage User Dynamic Pricing"
              >
                <div className="nav-item-icon">
                  <i className="fas fa-sliders-h" />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-label">Dynamic Pricing</span>
                )}
              </div>
            )}

            {/* Lead Management */}
            {(hasAdminAccess("LEADS") ||
              hasAdminAccess("LEAD_MANAGEMENT") ||
              hasAdminAccess("DASHBOARD") ||
              hasAdminAccess("USERS")) && (
              <div
                className={`nav-item ${
                  isActive("/dashboard/leads") || isActive("/dashboard/lead-management") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/dashboard/leads")}
                title="Lead Management"
              >
                <div className="nav-item-icon">
                  <i className="fas fa-address-book" />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-label">Lead Management</span>
                )}
              </div>
            )}

            {/* Add Blogs */}
            {hasAdminAccess("BLOGS") && (
              <div
                className={`nav-item ${
                  isActive("/dashboard/blogs") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/dashboard/blogs")}
                title="Add Blogs"
              >
                <div className="nav-item-icon">
                  <i className="fas fa-newspaper" />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-label">Add Blogs</span>
                )}
              </div>
            )}

            {/* Admin Accounts */}
            {hasAdminAccess("ADMIN_ACCOUNTS") && (
              <div
                className={`nav-item ${
                  isActive("/dashboard/admin-accounts") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/dashboard/admin-accounts")}
                title="Admin Accounts"
              >
                <div className="nav-item-icon">
                  <i className="fas fa-user-shield" />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-label">Admin Accounts</span>
                )}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Sidebar Footer / User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar-circle">
            <i className="fas fa-user" />
          </div>
          {!isCollapsed && (
            <div className="user-info-text">
              <span className="user-name">
                {userRole === "admin" ? "Administrator" : "Client User"}
              </span>
              <span className="user-badge">{userRole || "User"}</span>
            </div>
          )}
          <button
            className="logout-btn"
            onClick={onLogout}
            title="Sign Out"
            aria-label="Logout"
          >
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
