import React, { useEffect, useState } from "react";
import OrderList from "./OrderList";
import { useSearchParams } from "react-router-dom";
import "./OrderManagement.css";

const UserOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userRole, setUserRole] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  useEffect(() => {
    handleSearchParamsChange(searchParams);
  }, [searchParams]);

  const handleSearchParamsChange = (params) => {
    const status = params.get("status");
    if (status) {
      setSelectedStatus(status);
    } else {
      setSelectedStatus("all");
    }
  };

  return (
    <div className="order-mgmt-container">
      <div className="order-mgmt-card">
        {/* Card Header with Title & Filter Tabs */}
        <div className="order-card-header">
          <div className="order-header-left">
            <div className="order-header-icon">
              <i className="fas fa-boxes"></i>
            </div>
            <div>
              <h4 className="order-card-title">All Customer Orders</h4>
              <p className="order-card-subtitle">
                Filter by progress status, search by customer or order ID
              </p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="order-filter-tabs">
            <button
              type="button"
              className={`order-tab-btn ${selectedStatus === "all" ? "active" : ""}`}
              onClick={() => setSearchParams({ status: "all" })}
            >
              <i className="fas fa-layer-group"></i>
              <span>All Orders</span>
            </button>
            <button
              type="button"
              className={`order-tab-btn ${selectedStatus === "ongoing" ? "active" : ""}`}
              onClick={() => setSearchParams({ status: "ongoing" })}
            >
              <i className="fas fa-clock"></i>
              <span>Ongoing</span>
            </button>
            <button
              type="button"
              className={`order-tab-btn ${selectedStatus === "completed" ? "active" : ""}`}
              onClick={() => setSearchParams({ status: "completed" })}
            >
              <i className="fas fa-check-circle"></i>
              <span>Completed</span>
            </button>
          </div>
        </div>

        {/* Orders List Content */}
        <div className="order-card-body">
          <OrderList selectedStatus={selectedStatus} />
        </div>
      </div>
    </div>
  );
};

export default UserOrders;
