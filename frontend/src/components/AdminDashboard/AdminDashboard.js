import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import { MDBIcon } from "mdb-react-ui-kit";
import api from "../../utils/api";
import "./AdminDashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Format currency in Indian format (₹)
const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  return "₹" + Number(val).toLocaleString("en-IN");
};

// Format general number
const formatNumber = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return Number(val).toLocaleString("en-IN");
};

// Format Date
const formatDate = (val) => {
  if (!val) return "N/A";
  return new Date(val).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const token = localStorage.getItem("authToken");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get("/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setData(null);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load analytics data. Please check your network or try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // --------------------------------------------------------------------------
  // Chart Configs & Data Memoization
  // --------------------------------------------------------------------------

  // 1. Monthly Revenue Bar Chart (Palette: Red, Navy, Slate, Silver)
  const monthlyRevenueChartData = useMemo(() => {
    const items = data?.charts?.monthlyRevenueTrends || [];
    const maxVal = Math.max(...items.map((i) => i.revenue), 1);
    const palettePattern = ["#5C6B7E", "#1E293B", "#E31E24", "#94A3B8", "#1E293B", "#5C6B7E"];

    return {
      labels: items.map((item) => item.label),
      datasets: [
        {
          label: "Revenue",
          data: items.map((item) => item.revenue),
          backgroundColor: items.map((item, idx) =>
            item.revenue === maxVal
              ? "#E31E24" // Highlight peak month in Brand Red
              : palettePattern[idx % palettePattern.length]
          ),
          borderRadius: 8,
          barPercentage: 0.55,
        },
      ],
    };
  }, [data]);

  const monthlyRevenueOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 10,
          callbacks: {
            label: (context) => `Revenue: ${formatCurrency(context.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#64748b", font: { size: 11 } },
        },
        y: {
          grid: { color: "#e2e8f0" },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
            callback: (val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`),
          },
        },
      },
    }),
    []
  );

  // 2. Monthly Orders Count Bar Chart (Palette: Slate, Navy, Red highlight)
  const monthlyOrdersChartData = useMemo(() => {
    const items = data?.charts?.monthlyRevenueTrends || [];
    const maxOrders = Math.max(...items.map((i) => i.orders), 1);
    const palettePattern = ["#1E293B", "#5C6B7E", "#94A3B8", "#1E293B", "#E31E24", "#5C6B7E"];

    return {
      labels: items.map((item) => item.label),
      datasets: [
        {
          label: "Orders",
          data: items.map((item) => item.orders),
          backgroundColor: items.map((item, idx) =>
            item.orders === maxOrders
              ? "#E31E24" // Highlight highest order volume in Brand Red
              : palettePattern[idx % palettePattern.length]
          ),
          borderRadius: 8,
          barPercentage: 0.55,
        },
      ],
    };
  }, [data]);

  const monthlyOrdersOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 10,
          callbacks: {
            label: (context) => `Orders: ${formatNumber(context.parsed.y)} orders`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#64748b", font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "#e2e8f0" },
          ticks: {
            stepSize: 1,
            color: "#64748b",
            font: { size: 11 },
            callback: (val) => (Number.isInteger(val) ? val : null),
          },
        },
      },
    }),
    []
  );

  // 3. Top 10 Products by Volume & Revenue (Bar Chart)
  const topProductsChartData = useMemo(() => {
    const items = data?.charts?.topProducts || [];
    return {
      labels: items.map((p) =>
        p.description.length > 20
          ? p.description.substring(0, 18) + "..."
          : p.description
      ),
      datasets: [
        {
          label: "Quantity Sold",
          data: items.map((p) => p.totalQuantity),
          backgroundColor: items.map((_, idx) =>
            idx === 0 ? "#E31E24" : idx % 2 === 0 ? "#1E293B" : "#5C6B7E"
          ),
          borderRadius: 6,
          barPercentage: 0.6,
        },
      ],
    };
  }, [data]);

  const topProductsOptions = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          callbacks: {
            title: (items) => {
              if (!items.length) return "";
              const idx = items[0].dataIndex;
              return data?.charts?.topProducts?.[idx]?.description || "";
            },
            label: (context) => {
              const idx = context.dataIndex;
              const prod = data?.charts?.topProducts?.[idx];
              return [
                `Qty: ${formatNumber(prod?.totalQuantity)} units`,
                `Amount: ${formatCurrency(prod?.totalAmount)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "#e2e8f0" },
          ticks: { color: "#64748b", font: { size: 11 } },
        },
        y: {
          grid: { display: false },
          ticks: { color: "#1e293b", font: { size: 11, weight: "600" } },
        },
      },
    }),
    [data]
  );

  // 4. Top Cities by Revenue (Bar Chart)
  const topCitiesChartData = useMemo(() => {
    const items = data?.charts?.topCities || [];
    return {
      labels: items.map((c) => c.city),
      datasets: [
        {
          label: "Revenue (₹)",
          data: items.map((c) => c.totalRevenue),
          backgroundColor: items.map((_, idx) =>
            idx === 0 ? "#E31E24" : idx % 2 === 0 ? "#5C6B7E" : "#1E293B"
          ),
          borderRadius: 6,
          barPercentage: 0.5,
        },
      ],
    };
  }, [data]);

  const topCitiesOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          callbacks: {
            label: (context) => `Revenue: ${formatCurrency(context.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#64748b", font: { size: 11 } },
        },
        y: {
          grid: { color: "#e2e8f0" },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
            callback: (val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`),
          },
        },
      },
    }),
    []
  );

  // 5. Order Fulfillment Status (Completed vs Processing) - Pie Chart
  const orderFulfillmentPieData = useMemo(() => {
    const completed = data?.summary?.orders?.completedOrders || 0;
    const processing =
      data?.summary?.orders?.pendingOrders !== undefined
        ? data?.summary?.orders?.pendingOrders
        : Math.max(0, (data?.summary?.orders?.totalOrders || 0) - completed);

    return {
      labels: ["Completed Orders", "Processing / In-Progress"],
      datasets: [
        {
          data: [completed, processing],
          backgroundColor: ["#1E293B", "#E31E24"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [data]);

  const orderFulfillmentPieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            padding: 16,
            font: { size: 12, weight: "600" },
            color: "#334155",
          },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const val = context.parsed;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${formatNumber(val)} orders (${pct}%)`;
            },
          },
        },
      },
    }),
    []
  );

  // 6. Payment Realization (Collections vs Pending Balance) - Pie Chart
  const paymentRealizationPieData = useMemo(() => {
    const collected = data?.summary?.revenue?.totalCollectedAmount || 0;
    const pending = data?.summary?.revenue?.pendingPaymentAmount || 0;

    return {
      labels: ["Collected Revenue", "Pending Balance"],
      datasets: [
        {
          data: [collected, pending],
          backgroundColor: ["#1E293B", "#5C6B7E"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [data]);

  const paymentRealizationPieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            padding: 16,
            font: { size: 12, weight: "600" },
            color: "#334155",
          },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const val = context.parsed;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
            },
          },
        },
      },
    }),
    []
  );

  // Summary Shortcuts
  const summary = data?.summary;
  const alerts = summary?.alerts;

  // --------------------------------------------------------------------------
  // Render Loading Skeleton
  // --------------------------------------------------------------------------
  if (loading && !data) {
    return (
      <div className="admin-analytics-wrapper">
        <div className="analytics-header-card analytics-skeleton" style={{ height: "90px" }} />
        <div className="kpi-cards-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-kpi-card analytics-skeleton" />
          ))}
        </div>
        <div className="analytics-grid-row grid-2-cols">
          <div className="skeleton-chart-card analytics-skeleton" />
          <div className="skeleton-chart-card analytics-skeleton" />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render Error State
  // --------------------------------------------------------------------------
  if (error && !data) {
    return (
      <div className="admin-analytics-wrapper">
        <div className="analytics-error-card">
          <MDBIcon fas icon="exclamation-triangle" className="analytics-error-icon" />
          <h4 className="fw-bold text-dark mb-2">Analytics Unavailable</h4>
          <p className="text-muted mb-4">{error}</p>
          <button className="analytics-btn-refresh" onClick={fetchAnalytics}>
            <MDBIcon fas icon="redo" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics-wrapper">
      {/* 1. Header & Controls */}
      <div className="analytics-header-card">
        <div className="analytics-header-left">
          <div className="analytics-brand-icon">
            <MDBIcon fas icon="chart-line" />
          </div>
          <div>
            <h2 className="analytics-title">Glazia Executive Analytics</h2>
            <p className="analytics-subtitle">
              Real-time KPIs, revenue performance, order fulfillment, and operational health
            </p>
          </div>
        </div>

        <div className="analytics-header-right">
          {summary?.nalco?.latestPrice && (
            <div className="nalco-pill-badge" title="Latest Nalco Aluminum Benchmark Price">
              <span className="nalco-indicator" />
              <span>NALCO Price:</span>
              <strong className="text-dark">
                ₹{summary.nalco.latestPrice > 1000
                  ? (summary.nalco.latestPrice / 1000).toFixed(2)
                  : summary.nalco.latestPrice} / Kg
              </strong>
            </div>
          )}

          <button
            className="analytics-btn-refresh"
            onClick={fetchAnalytics}
            disabled={loading}
            title="Refresh analytics data"
          >
            <MDBIcon fas icon="sync" className={loading ? "fa-spin" : ""} />
            <span>{loading ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* 2. Operational Alert Banner */}
      {alerts &&
        (alerts.pendingPaymentProofsCount > 0 ||
          alerts.pendingStockAdjustmentRequestsCount > 0 ||
          alerts.overduePaymentsCount > 0) && (
          <div className="operational-alerts-strip">
            {alerts.pendingPaymentProofsCount > 0 && (
              <div className="alert-chip">
                <div className="alert-chip-left">
                  <div className="alert-chip-icon warning">
                    <MDBIcon fas icon="receipt" />
                  </div>
                  <span className="alert-chip-title">Payment Slips Pending</span>
                </div>
                <span className="alert-chip-badge warning">
                  {alerts.pendingPaymentProofsCount} Review
                </span>
              </div>
            )}

            {alerts.pendingStockAdjustmentRequestsCount > 0 && (
              <div className="alert-chip">
                <div className="alert-chip-left">
                  <div className="alert-chip-icon info">
                    <MDBIcon fas icon="dolly-flatbed" />
                  </div>
                  <span className="alert-chip-title">Dealer Stock Requests</span>
                </div>
                <span className="alert-chip-badge info">
                  {alerts.pendingStockAdjustmentRequestsCount} Pending
                </span>
              </div>
            )}

            {alerts.overduePaymentsCount > 0 && (
              <div className="alert-chip">
                <div className="alert-chip-left">
                  <div className="alert-chip-icon danger">
                    <MDBIcon fas icon="clock" />
                  </div>
                  <span className="alert-chip-title">Overdue Installments</span>
                </div>
                <span className="alert-chip-badge danger">
                  {alerts.overduePaymentsCount} Overdue
                </span>
              </div>
            )}
          </div>
        )}

      {/* 3. High-Level KPI Summary Cards */}
      <div className="kpi-cards-grid">
        {/* Total Revenue */}
        <div className="kpi-card brand-red">
          <div className="kpi-card-top">
            <p className="kpi-card-label">Total Revenue</p>
            <div className="kpi-card-icon brand-red">
              <MDBIcon fas icon="wallet" />
            </div>
          </div>
          <h3 className="kpi-card-value">{formatCurrency(summary?.revenue?.totalRevenue)}</h3>
          <div className="kpi-card-subinfo">
            <span>This Month: {formatCurrency(summary?.revenue?.thisMonthRevenue)}</span>
            <span
              className={`growth-badge ${(summary?.revenue?.growthPercentage || 0) >= 0 ? "positive" : "negative"
                }`}
            >
              <MDBIcon
                fas
                icon={
                  (summary?.revenue?.growthPercentage || 0) >= 0 ? "arrow-up" : "arrow-down"
                }
              />
              {Math.abs(summary?.revenue?.growthPercentage || 0)}% MoM
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="kpi-card navy">
          <div className="kpi-card-top">
            <p className="kpi-card-label">Orders Processed</p>
            <div className="kpi-card-icon navy">
              <MDBIcon fas icon="shopping-cart" />
            </div>
          </div>
          <h3 className="kpi-card-value">{formatNumber(summary?.orders?.totalOrders)}</h3>
          <div className="kpi-card-subinfo">
            <span>Completed: {formatNumber(summary?.orders?.completedOrders)}</span>
            <span className="growth-badge positive">
              {summary?.orders?.completionRatePercentage}% Done
            </span>
          </div>
        </div>

        {/* Registered Users & Network */}
        <div className="kpi-card slate">
          <div className="kpi-card-top">
            <p className="kpi-card-label">Network Accounts</p>
            <div className="kpi-card-icon slate">
              <MDBIcon fas icon="users" />
            </div>
          </div>
          <h3 className="kpi-card-value">{formatNumber(summary?.users?.totalUsers)}</h3>
          <div className="kpi-card-subinfo">
            <span>
              {summary?.users?.fabricators} Fab · {summary?.users?.dealerships} Dealer
            </span>
            <span className="growth-badge neutral">
              +{summary?.users?.newUsersThisMonth} new
            </span>
          </div>
        </div>

        {/* Warehouse Inventory Stock */}
        <div className="kpi-card dark">
          <div className="kpi-card-top">
            <p className="kpi-card-label">Warehouse Inventory</p>
            <div className="kpi-card-icon dark">
              <MDBIcon fas icon="warehouse" />
            </div>
          </div>
          <h3 className="kpi-card-value">
            {formatNumber(summary?.inventory?.totalUnits)}{" "}
            <span className="fs-6 text-muted fw-normal">units</span>
          </h3>
          <div className="kpi-card-subinfo">
            <span>{summary?.inventory?.totalSKUs} Catalog SKUs</span>
            <span className="growth-badge neutral">
              {summary?.inventory?.dealershipTotalUnits || 0} dealer units
            </span>
          </div>
        </div>

        {/* Payment Collections vs Pending */}
        <div className="kpi-card crimson">
          <div className="kpi-card-top">
            <p className="kpi-card-label">Collections vs Pending</p>
            <div className="kpi-card-icon crimson">
              <MDBIcon fas icon="hand-holding-usd" />
            </div>
          </div>
          <h3 className="kpi-card-value">
            {formatCurrency(summary?.revenue?.totalCollectedAmount)}
          </h3>
          <div className="kpi-card-subinfo">
            <span>Pending: {formatCurrency(summary?.revenue?.pendingPaymentAmount)}</span>
            <span className="growth-badge neutral">
              Avg {formatCurrency(summary?.revenue?.averageOrderValue)}/ord
            </span>
          </div>
        </div>

        {/* Leads Pipeline */}
        <div className="kpi-card silver">
          <div className="kpi-card-top">
            <p className="kpi-card-label">Customer Inquiries</p>
            <div className="kpi-card-icon silver">
              <MDBIcon fas icon="phone-volume" />
            </div>
          </div>
          <h3 className="kpi-card-value">{formatNumber(summary?.leads?.totalLeads)}</h3>
          <div className="kpi-card-subinfo">
            <span>{summary?.leads?.closedLeads} Converted</span>
            <span className="growth-badge positive">
              {summary?.leads?.conversionRatePercentage}% Conv. Rate
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Charts Section - Row 1 (Super Simple Side-by-Side Bar Charts) */}
      <div className="analytics-grid-row grid-equal-2-cols mb-4">
        {/* Monthly Revenue Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title-wrap">
              <MDBIcon fas icon="wallet" className="chart-card-icon" />
              <h4 className="chart-card-title">Monthly Revenue (₹)</h4>
            </div>
            <span className="chart-card-badge">Last 6 Months</span>
          </div>
          <div className="chart-container-box" style={{ minHeight: "280px" }}>
            <Bar data={monthlyRevenueChartData} options={monthlyRevenueOptions} />
          </div>
        </div>

        {/* Monthly Orders Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title-wrap">
              <MDBIcon fas icon="shopping-bag" className="chart-card-icon" />
              <h4 className="chart-card-title">Monthly Orders Placed</h4>
            </div>
            <span className="chart-card-badge">Last 6 Months</span>
          </div>
          <div className="chart-container-box" style={{ minHeight: "280px" }}>
            <Bar data={monthlyOrdersChartData} options={monthlyOrdersOptions} />
          </div>
        </div>
      </div>

      {/* 5. Charts Section - Row 2 */}
      <div className="analytics-grid-row grid-equal-2-cols">
        {/* Top 10 Selling Products */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title-wrap">
              <MDBIcon fas icon="medal" className="chart-card-icon" />
              <h4 className="chart-card-title">Top Selling Products by Volume</h4>
            </div>
            <span className="chart-card-badge">Top 10 SKUs</span>
          </div>
          <div className="chart-container-box">
            <Bar data={topProductsChartData} options={topProductsOptions} />
          </div>
        </div>

        {/* Top Cities by Sales Volume */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title-wrap">
              <MDBIcon fas icon="city" className="chart-card-icon" />
              <h4 className="chart-card-title">Regional Sales by City</h4>
            </div>
            <span className="chart-card-badge">Top Locations</span>
          </div>
          <div className="chart-container-box">
            <Bar data={topCitiesChartData} options={topCitiesOptions} />
          </div>
        </div>
      </div>

      {/* 6. Charts Section - Row 3 (Order Fulfillment & Financial Realization Pie Charts) */}
      <div className="analytics-grid-row grid-equal-2-cols mb-4">
        {/* Order Fulfillment Status (Completed vs Processing) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title-wrap">
              <MDBIcon fas icon="clipboard-check" className="chart-card-icon" />
              <h4 className="chart-card-title">Order Fulfillment Status</h4>
            </div>
            <span className="chart-card-badge">
              {formatNumber(summary?.orders?.totalOrders || 133)} Total Orders
            </span>
          </div>
          <div className="chart-container-box" style={{ minHeight: "270px" }}>
            <Pie data={orderFulfillmentPieData} options={orderFulfillmentPieOptions} />
          </div>
        </div>

        {/* Payment Realization (Collections vs Pending) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title-wrap">
              <MDBIcon fas icon="hand-holding-usd" className="chart-card-icon" />
              <h4 className="chart-card-title">Payment Realization</h4>
            </div>
            <span className="chart-card-badge">
              {formatCurrency(summary?.revenue?.totalRevenue)} Billed
            </span>
          </div>
          <div className="chart-container-box" style={{ minHeight: "270px" }}>
            <Pie data={paymentRealizationPieData} options={paymentRealizationPieOptions} />
          </div>
        </div>
      </div>

      {/* 7. Live Recent Orders Table */}
      <div className="table-card mb-4">
        <div className="table-card-header">
          <h4 className="table-card-title">
            <MDBIcon fas icon="clock" className="text-secondary" /> Recent Orders Feed
          </h4>
          <span className="chart-card-badge">Latest 8</span>
        </div>
        <div className="dashboard-table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>City</th>
                <th>Amount</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.feeds?.recentOrders?.length > 0 ? (
                data.feeds.recentOrders.map((order) => (
                  <tr key={order.orderId || order._id}>
                    <td className="fw-bold text-dark">
                      #{order.orderId ? String(order.orderId).padStart(4, "0") : "N/A"}
                    </td>
                    <td>{order.customerName}</td>
                    <td>{order.city}</td>
                    <td className="fw-bold">{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className="status-pill self">{order.deliveryType}</span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${order.isComplete ? "complete" : "pending"
                          }`}
                      >
                        {order.isComplete ? "Completed" : "Processing"}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No recent orders recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Top Customer / Fabricator Leaderboard */}
      <div className="table-card">
        <div className="table-card-header">
          <h4 className="table-card-title">
            <MDBIcon fas icon="trophy" className="text-secondary" /> Top Fabricators & Buyers
          </h4>
          <span className="chart-card-badge">Highest Lifetime Value</span>
        </div>
        <div className="dashboard-table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Client Name</th>
                <th>Phone Number</th>
                <th>City</th>
                <th>Total Orders</th>
                <th>Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {data?.charts?.topCustomers?.length > 0 ? (
                data.charts.topCustomers.map((cust, idx) => (
                  <tr key={cust.userId || idx}>
                    <td className="fw-bold text-muted">#{idx + 1}</td>
                    <td className="fw-bold text-dark">{cust.name}</td>
                    <td>{cust.phoneNumber || "N/A"}</td>
                    <td>{cust.city || "N/A"}</td>
                    <td>{formatNumber(cust.ordersCount)} orders</td>
                    <td className="fw-bold text-primary">{formatCurrency(cust.totalSpend)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No customer spend history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
