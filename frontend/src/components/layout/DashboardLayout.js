import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import DashboardFooter from "./DashboardFooter";
import "./DashboardLayout.css";

const DashboardLayout = ({ children, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("glazia_sidebar_collapsed") === "true";
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("glazia_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className={`glazia-dashboard-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        onLogout={onLogout}
      />
      <div className="glazia-main-container">
        <TopHeader
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={toggleSidebar}
          onLogout={onLogout}
        />
        <main className="glazia-page-body">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default DashboardLayout;
