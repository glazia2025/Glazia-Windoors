import React from "react";
import { useLocation } from "react-router-dom";
import "./TopHeader.css";

const getPageTitle = (pathname, search) => {
  if (pathname === "/dashboard") return { title: "Dashboard", subtitle: "Overview & configurations" };
  if (pathname.includes("/orders")) {
    const params = new URLSearchParams(search);
    const status = params.get("status");
    if (status === "ongoing") return { title: "Ongoing Orders", subtitle: "Active manufacturing & processing" };
    if (status === "completed") return { title: "Completed Orders", subtitle: "Archived & delivered orders" };
    return { title: "Orders Management", subtitle: "Track, filter and manage customer orders" };
  }
  if (pathname.includes("/quotations")) return { title: "Quotations", subtitle: "Create and manage system quotations" };
  if (pathname.includes("/users")) return { title: "User Management", subtitle: "Manage clients and partner agreements" };
  if (pathname.includes("/blogs")) return { title: "Blog Management", subtitle: "Manage customer facing articles" };
  if (pathname.includes("/dynamic-pricing")) return { title: "Manage User Dynamic Pricing", subtitle: "Configure custom hardware & profile pricing rules for client accounts" };
  if (pathname.includes("/leads") || pathname.includes("/lead-management")) return { title: "Lead Management", subtitle: "Track, manage and follow up on customer inquiries" };
  if (pathname.includes("/stock-approvals")) return { title: "Stock Approvals", subtitle: "Review and approve dealership stock adjustments" };
  if (pathname.includes("/inventory")) return { title: "Main Inventory", subtitle: "Central stock levels, reorder thresholds and history" };
  if (pathname.includes("/admin-accounts")) return { title: "Admin Accounts", subtitle: "Manage administrator accounts and module permissions" };
  return { title: "Glazia Portal", subtitle: "Window & Door Systems" };
};

const TopHeader = () => {
  const location = useLocation();
  const userRole = localStorage.getItem("userRole") || "User";
  const { title, subtitle } = getPageTitle(location.pathname, location.search);

  return (
    <header className="glazia-topbar">
      {/* Left side: Page Title & Subtitle */}
      <div className="topbar-left">
        <div className="topbar-heading">
          <h1 className="topbar-title">{title}</h1>
          <span className="topbar-subtitle">{subtitle}</span>
        </div>
      </div>

      {/* Right side: Admin Mode badge */}
      <div className="topbar-right">
        <span className="topbar-badge">
          <i className="fas fa-shield-alt me-1" />
          {userRole === "admin" ? "Admin Mode" : "User Mode"}
        </span>
      </div>
    </header>
  );
};

export default TopHeader;
