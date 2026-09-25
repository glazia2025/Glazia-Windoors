import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api, { BASE_API_URL, QUOTATION_BASE_API_URL } from "../../utils/api";
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
    quotations: false,
  });
  const [activeFlyout, setActiveFlyout] = useState(null);
  const [quotationCounts, setQuotationCounts] = useState({});

  const quotationSubItems = [
    { label: "Quotations", path: "/dashboard/quotations", icon: "fas fa-file-invoice-dollar", exact: true },
    { label: "Systems", path: "/dashboard/quotations/systems", icon: "fas fa-cubes" },
    { label: "Series", path: "/dashboard/quotations/series", icon: "fas fa-sitemap" },
    { label: "Option Sets", path: "/dashboard/quotations/option-sets", icon: "fas fa-palette" },
    { label: "Louvers Rate", path: "/dashboard/quotations/louvers-rate", icon: "fas fa-layer-group", altPath: "/dashboard/quotations/base-rates" },
    { label: "Handle Rules", path: "/dashboard/quotations/handle-rules", icon: "fas fa-hand-paper" },
    { label: "Handle Options", path: "/dashboard/quotations/handle-options", icon: "fas fa-swatchbook" },
    { label: "Cutting Schedule", path: "/dashboard/quotations/cutting-schedule", icon: "fas fa-ruler-combined" },
    { label: "Glass Beading", path: "/dashboard/quotations/glass-beading", icon: "fas fa-link" },
    { label: "Mullion / Coupler", path: "/dashboard/quotations/mullion-coupler", icon: "fas fa-grip-lines-vertical" },
    { label: "Hardware", path: "/dashboard/quotations/hardware-linking", icon: "fas fa-tools", altPath: "/dashboard/quotations/hardware" },
  ];

  const isQuotationSubItemActive = (item) => {
    if (item.exact) {
      return location.pathname === "/dashboard/quotations" || location.pathname === "/dashboard/quotations/all";
    }
    if (item.altPath && location.pathname.startsWith(item.altPath)) {
      return true;
    }
    return location.pathname.startsWith(item.path);
  };

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/quotations")) {
      setExpandedMenus((prev) => ({ ...prev, quotations: true }));
      fetchQuotationCounts();
    }
  }, [location.pathname]);

  const fetchQuotationCounts = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const authConfig = { headers: { Authorization: `Bearer ${token}` } };
      const [
        quotesRes,
        systemsRes,
        seriesRes,
        optionsRes,
        baseRatesRes,
        handleRulesRes,
        handleOptionsRes,
        cuttingConfigsRes,
        mullionRes,
        hardwareRes
      ] = await Promise.allSettled([
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations?page=1&limit=1`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/systems`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/series`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/option-sets`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/base-rates`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/handle-rules`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/handle-options`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/configs`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/mullion-coupler/series`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/hardware-linking/descriptions`, authConfig),
      ]);

      const quotesCount = quotesRes.status === "fulfilled" ? (quotesRes.value.data?.total || 0) : 0;
      const systemsCount = systemsRes.status === "fulfilled" ? (systemsRes.value.data?.length || 0) : 0;
      const seriesCount = seriesRes.status === "fulfilled" ? (seriesRes.value.data?.length || 0) : 0;
      const optionsCount = optionsRes.status === "fulfilled" ? (optionsRes.value.data?.length || 0) : 0;
      const baseRatesCount = baseRatesRes.status === "fulfilled" ? (baseRatesRes.value.data?.baseRates?.length || baseRatesRes.value.data?.length || 0) : 0;
      const handleRulesCount = handleRulesRes.status === "fulfilled" ? (handleRulesRes.value.data?.length || 0) : 0;
      const handleOptionsCount = handleOptionsRes.status === "fulfilled" ? (handleOptionsRes.value.data?.length || 0) : 0;
      const cuttingCount = cuttingConfigsRes.status === "fulfilled" ? (cuttingConfigsRes.value.data?.filter(c => (c.schedules || []).reduce((sum, s) => sum + (s.lines?.length || 0), 0) > 0)?.length || 0) : 0;
      const glassBeadingCount = cuttingConfigsRes.status === "fulfilled" ? (cuttingConfigsRes.value.data?.reduce((sum, c) => sum + (c.glassBeadingLinks?.filter(l => l.beadingSapCode)?.length || 0), 0) || 0) : 0;
      const mullionCount = mullionRes.status === "fulfilled" ? (mullionRes.value.data?.filter(i => i.configured)?.length || 0) : 0;
      const hardwareCount = hardwareRes.status === "fulfilled" ? (hardwareRes.value.data?.filter(i => i.configured)?.length || 0) : 0;

      setQuotationCounts({
        "/dashboard/quotations": quotesCount,
        "/dashboard/quotations/systems": systemsCount,
        "/dashboard/quotations/series": seriesCount,
        "/dashboard/quotations/option-sets": optionsCount,
        "/dashboard/quotations/louvers-rate": baseRatesCount,
        "/dashboard/quotations/handle-rules": handleRulesCount,
        "/dashboard/quotations/handle-options": handleOptionsCount,
        "/dashboard/quotations/cutting-schedule": cuttingCount,
        "/dashboard/quotations/glass-beading": glassBeadingCount,
        "/dashboard/quotations/mullion-coupler": mullionCount,
        "/dashboard/quotations/hardware-linking": hardwareCount,
      });
    } catch (e) {
      console.error("Sidebar count fetch error", e);
    }
  };

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
          `${BASE_API_URL}/${window.location.pathname.includes("admin") ? "admin" : "user"
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
    navigate("/dashboard/profile");
    setActiveFlyout(null);
  };

  const handleHardwareSelect = (hardware) => {
    dispatch(setActiveProfile(undefined));
    dispatch(setActiveOption(hardware));
    dispatch(setSelectedOption("hardware"));
    navigate("/dashboard/hardware");
    setActiveFlyout(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setActiveFlyout(null);
  };

  const isActive = (path, queryKey, queryValue, exact = false) => {
    if (queryKey && queryValue) {
      const params = new URLSearchParams(location.search);
      return (location.pathname === path || (!exact && location.pathname.startsWith(path + "/"))) && params.get(queryKey) === queryValue;
    }
    if (exact || path === "/dashboard") {
      return location.pathname === path || location.pathname === path + "/";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isProfileActive = location.pathname.startsWith("/dashboard/profile");
  const isHardwareActive = location.pathname.startsWith("/dashboard/hardware");

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
            className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
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
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
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

        {/* Profile */}
        {(userRole !== "admin" || hasAdminAccess("PRODUCTS")) && (
          <div
            className={`nav-item ${isActive("/dashboard/profile") ? "active" : ""
              }`}
            onClick={() => handleNavigation("/dashboard/profile")}
            title="Profile"
          >
            <div className="nav-item-icon">
              <i className="fas fa-window-restore" />
            </div>
            {!isCollapsed && <span className="nav-item-label">Profile</span>}
          </div>
        )}

        {/* Hardware */}
        {(userRole !== "admin" || hasAdminAccess("PRODUCTS")) && (
          <div
            className={`nav-item ${isActive("/dashboard/hardware") ? "active" : ""
              }`}
            onClick={() => handleNavigation("/dashboard/hardware")}
            title="Hardware"
          >
            <div className="nav-item-icon">
              <i className="fas fa-tools" />
            </div>
            {!isCollapsed && <span className="nav-item-label">Hardware</span>}
          </div>
        )}

        {/* Orders */}
        {(userRole !== "admin" || hasAdminAccess("ORDERS")) && (
          <div
            className={`nav-item nav-item-has-submenu ${location.pathname.startsWith("/dashboard/orders")
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
                    className={`fas fa-chevron-down submenu-arrow ${expandedMenus.orders ? "rotated" : ""
                      }`}
                  />
                </>
              )}
            </div>

            {/* Orders Submenu */}
            {!isCollapsed && expandedMenus.orders && (
              <div className="sidebar-submenu">
                <div
                  className={`submenu-item ${isActive("/dashboard/orders", "status", "ongoing")
                      ? "active"
                      : ""
                    }`}
                  onClick={() => handleNavigation("/dashboard/orders?status=ongoing")}
                >
                  <i className="fas fa-clock submenu-bullet" />
                  <span>Ongoing Orders</span>
                </div>
                <div
                  className={`submenu-item ${isActive("/dashboard/orders", "status", "completed")
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
                  className={`submenu-item ${isActive("/dashboard/orders", "status", "all") ||
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
                className={`nav-item ${isActive("/dashboard/stock-approvals") ? "active" : ""
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
                className={`nav-item ${isActive("/dashboard/inventory") ? "active" : ""
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

            {/* Quotations Submenu */}
            {hasAdminAccess("QUOTATIONS") && (
              <div
                className={`nav-item nav-item-has-submenu ${location.pathname.startsWith("/dashboard/quotations")
                    ? "active-parent"
                    : ""
                  }`}
                onMouseEnter={() => isCollapsed && setActiveFlyout("quotations")}
              >
                <div
                  className="nav-item-header"
                  onClick={() => {
                    if (isCollapsed) {
                      setActiveFlyout(activeFlyout === "quotations" ? null : "quotations");
                    } else {
                      toggleSubmenu("quotations");
                    }
                  }}
                  title="Quotations"
                >
                  <div className="nav-item-icon">
                    <i className="fas fa-file-invoice-dollar" />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="nav-item-label">Quotations</span>
                      <i
                        className={`fas fa-chevron-down submenu-arrow ${expandedMenus.quotations ? "rotated" : ""
                          }`}
                      />
                    </>
                  )}
                </div>

                {/* Submenu List */}
                {!isCollapsed && expandedMenus.quotations && (
                  <div className="sidebar-submenu">
                    {quotationSubItems.map((item) => (
                      <div
                        key={item.path}
                        className={`submenu-item ${isQuotationSubItemActive(item) ? "active" : ""}`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <i className={`${item.icon} me-1`} style={{ fontSize: "11px", width: "14px" }} />
                        <span>{item.label}</span>
                        {quotationCounts[item.path] !== undefined && (
                          <span className="sidebar-count-badge">
                            {quotationCounts[item.path]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Flyout Menu in Collapsed Mode */}
                {isCollapsed && activeFlyout === "quotations" && (
                  <div className="sidebar-flyout-menu">
                    <div className="flyout-header">Quotations Control</div>
                    {quotationSubItems.map((item) => (
                      <div
                        key={item.path}
                        className={`flyout-item ${isQuotationSubItemActive(item) ? "active" : ""}`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <i className={`${item.icon} me-2`} style={{ fontSize: "12px", width: "16px" }} />
                        <span>{item.label}</span>
                        {quotationCounts[item.path] !== undefined && (
                          <span className="sidebar-count-badge ms-auto">
                            {quotationCounts[item.path]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users */}
            {hasAdminAccess("USERS") && (
              <div
                className={`nav-item ${isActive("/dashboard/users") ? "active" : ""
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
                className={`nav-item ${isActive("/dashboard/dynamic-pricing") ? "active" : ""
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
                  className={`nav-item ${isActive("/dashboard/leads") || isActive("/dashboard/lead-management") ? "active" : ""
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
                className={`nav-item ${isActive("/dashboard/blogs") ? "active" : ""
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
                className={`nav-item ${isActive("/dashboard/admin-accounts") ? "active" : ""
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
