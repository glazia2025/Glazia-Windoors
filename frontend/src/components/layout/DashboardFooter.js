import React from "react";
import "./DashboardFooter.css";

const DashboardFooter = () => {
  return (
    <footer className="glazia-dashboard-footer">
      <div className="footer-left">
        <span>© 2026 Glazia Windoors CMS. All rights reserved.</span>
      </div>
      <div className="footer-right">
        <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
        <span className="footer-dot">•</span>
        <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
        <span className="footer-dot">•</span>
        <a href="#help" onClick={(e) => e.preventDefault()}>Support & Documentation</a>
      </div>
    </footer>
  );
};

export default DashboardFooter;
