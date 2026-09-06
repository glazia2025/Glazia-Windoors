import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatPrice } from "../utils/common";
import { MIN_SEARCH_TIME, SORT_KEY_OPTIONS } from "../enums/constants";
import { getOrderStatusLabel, getOrderStatus } from "../utils/order";
import "./OrderManagement.css";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "CL";
};

const OrderList = ({ selectedStatus }) => {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(null);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortKey, setSortKey] = useState("createdAt");
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [endReached, setEndReached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showItemsPopup, setShowItemsPopup] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearchChange(search);
    }, MIN_SEARCH_TIME);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [page, limit, sortOrder, sortKey, filters]);

  useEffect(() => {
    setPage(1);
    setEndReached(false);

    setFilters((cur) => ({
      ...cur,
      ...(selectedStatus && selectedStatus !== "all"
        ? { orderType: selectedStatus }
        : {}),
    }));
  }, [selectedStatus]);

  const handleSearchChange = (val) => {
    setPage(1);
    setEndReached(false);
    setFilters((cur) => {
      let next = { ...cur };
      if (val && val.length) {
        next.search = val;
      } else {
        delete next.search;
      }
      return next;
    });
  };

  const handleSort = (key) => {
    setPage(1);
    setEndReached(false);
    setSortKey(key.split(":")[0]);
    setSortOrder(key.split(":")[1]);
    setSortDropdownOpen(false);
  };

  const fetchOrders = async () => {
    if (endReached || !filters || !sortOrder || !sortKey || !page || !limit)
      return;

    try {
      setLoading(true);

      if (page === 1) {
        setOrders([]);
      }

      const token = localStorage.getItem("authToken");
      let params = {
        limit: limit,
        page: page,
        sortOrder: sortOrder,
        sortKey: sortKey,
        filters: { ...filters },
      };

      if (params.filters.orderType) delete params.filters.orderType;

      if (selectedStatus && selectedStatus !== "all") {
        params.filters.orderType = selectedStatus;
      }

      const response = await api.get("/user/getOrders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });

      if (response.data.length > 0) {
        setOrders((cur) => deduplicateOrders([...cur, ...response.data]));
        if (response.data.length < limit) {
          setEndReached(true);
        }
      } else {
        setEndReached(true);
      }
    } catch (error) {
      console.error("Error fetching ongoing orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const deduplicateOrders = (list) => {
    return list.filter(
      (order, index, self) =>
        index === self.findIndex((t) => t._id === order._id)
    );
  };

  const handleViewOrder = (orderId) => {
    if (userRole === "admin") {
      navigate(`/dashboard/orders/${orderId}`);
    } else {
      navigate(`/user/orders/${orderId}`);
    }
  };

  const renderDeliveryBadge = (deliveryType) => {
    switch (deliveryType) {
      case "SELF":
        return (
          <span className="delivery-badge delivery-self">
            <i className="fas fa-walking"></i>
            <span>Self Pickup</span>
          </span>
        );
      case "FULL":
        return (
          <span className="delivery-badge delivery-truck">
            <i className="fas fa-truck"></i>
            <span>Full Truck</span>
          </span>
        );
      case "PART":
        return (
          <span className="delivery-badge delivery-truck">
            <i className="fas fa-truck-pickup"></i>
            <span>Part Truck</span>
          </span>
        );
      default:
        return (
          <span className="delivery-badge delivery-self">
            <span>Standard</span>
          </span>
        );
    }
  };

  const renderStatusPill = (order) => {
    const statusKey = getOrderStatus(order);
    const label = getOrderStatusLabel(order);

    let statusVariant = "status-default";
    let dotColor = "#64748B";

    if (statusKey === "completed") {
      statusVariant = "status-completed";
      dotColor = "#10B981";
    } else if (statusKey?.includes("overdue")) {
      statusVariant = "status-overdue";
      dotColor = "#EF4444";
    } else if (
      statusKey?.includes("pending") ||
      statusKey?.includes("first") ||
      statusKey?.includes("proof")
    ) {
      statusVariant = "status-proof";
      dotColor = "#F59E0B";
    } else if (statusKey?.includes("dispatch")) {
      statusVariant = "status-dispatch";
      dotColor = "#3B82F6";
    }

    return (
      <span className={`order-status-pill ${statusVariant}`}>
        <span
          className="order-status-dot"
          style={{ backgroundColor: dotColor }}
        ></span>
        <span>{label}</span>
      </span>
    );
  };

  const displayedOrders = orders.filter((order) => {
    if (!search || !search.trim()) return true;
    const q = search.toLowerCase().trim();
    const idMatch = order._id?.toLowerCase().includes(q);
    const userMatch =
      order.user?.name?.toLowerCase().includes(q) ||
      order.user?.city?.toLowerCase().includes(q) ||
      order.user?.phoneNumber?.includes(q);
    const prodMatch = order.products?.some(
      (p) =>
        p.description?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q)
    );
    return idMatch || userMatch || prodMatch;
  });

  const currentSortLabel =
    SORT_KEY_OPTIONS.find((opt) => opt.value === `${sortKey}:${sortOrder}`)?.label || "Sort by";

  return (
    <>
      {/* Search & Sort Toolbar */}
      <div className="order-toolbar">
        <div className="order-search-box">
          <i className="fas fa-search order-search-icon"></i>
          <input
            type="text"
            className="order-search-input"
            placeholder="Search by customer, item description or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="order-search-clear"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="order-sort-wrapper" ref={sortRef}>
          <button
            type="button"
            className="order-sort-btn"
            onClick={() => setSortDropdownOpen((prev) => !prev)}
          >
            <i className="fas fa-arrow-down-wide-short text-primary"></i>
            <span>{currentSortLabel}</span>
            <i className="fas fa-chevron-down ms-1" style={{ fontSize: "11px" }}></i>
          </button>

          {sortDropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
                minWidth: "240px",
                zIndex: 100,
                padding: "6px",
              }}
            >
              {SORT_KEY_OPTIONS.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSort(option.value)}
                  style={{
                    padding: "9px 14px",
                    fontSize: "13px",
                    fontWeight: option.value === `${sortKey}:${sortOrder}` ? "600" : "500",
                    color: option.value === `${sortKey}:${sortOrder}` ? "#1e293b" : "#475569",
                    backgroundColor:
                      option.value === `${sortKey}:${sortOrder}` ? "#f1f5f9" : "transparent",
                    borderRadius: "7px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap" }}>{option.label}</span>
                  {option.value === `${sortKey}:${sortOrder}` && (
                    <i className="fas fa-check" style={{ fontSize: "11px", color: "#e31e24", flexShrink: 0 }}></i>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="d-none d-md-block order-table-wrapper">
        {displayedOrders && displayedOrders.length > 0 ? (
          <table className="order-main-table">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Order ID</th>
                <th style={{ width: "18%" }}>Customer</th>
                <th style={{ width: "22%" }}>Items & Details</th>
                <th style={{ width: "13%" }}>Delivery</th>
                <th style={{ width: "14%" }}>Status</th>
                <th style={{ width: "11%" }}>Order Date</th>
                <th style={{ width: "10%" }}>Amount</th>
                <th style={{ width: "8%", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="order-id-badge">
                      #{order._id.slice(0, 4)}...{order._id.slice(-4)}
                    </span>
                  </td>
                  <td>
                    <div className="order-user-cell">
                      <div className="order-user-avatar">
                        {getInitials(order.user?.name)}
                      </div>
                      <span className="order-user-name">
                        {order.user?.name || "Customer"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="order-items-cell">
                      <span className="order-item-primary" title={order.products[0]?.description}>
                        {order.products[0]?.description || "Standard Order Item"}
                      </span>
                      {order.products.length > 1 && (
                        <div
                          className="order-items-more-link"
                          onClick={() => {
                            setSelectedItems(order.products);
                            setShowItemsPopup(true);
                          }}
                        >
                          <i className="fas fa-cubes"></i>
                          <span>+{order.products.length - 1} more items</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{renderDeliveryBadge(order.deliveryType)}</td>
                  <td>{renderStatusPill(order)}</td>
                  <td>
                    <div className="order-date-cell">
                      <i className="far fa-calendar-alt"></i>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="order-amount-cell">
                      {formatPrice(
                        order.totalAmount ||
                          order.products.reduce(
                            (acc, product) => acc + product.amount,
                            0
                          ) * 1.18
                      )}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className="order-btn-view"
                      onClick={() => handleViewOrder(order._id)}
                      title="View complete order details"
                    >
                      <i className="far fa-eye"></i>
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : loading ? (
          <div className="lead-loading-state">
            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
            <span>Loading orders pipeline...</span>
          </div>
        ) : (
          <div className="order-empty-state">
            <div className="order-empty-icon">
              <i className="fas fa-box-open"></i>
            </div>
            <h6 className="order-empty-title">No orders found</h6>
            <p className="order-empty-desc">
              No orders matched your filter criteria or search query.
            </p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="d-block d-md-none order-mobile-list">
        {displayedOrders && displayedOrders.length > 0 ? (
          displayedOrders.map((order) => (
            <div key={order._id} className="order-mobile-card">
              <div className="order-mobile-header">
                <span className="order-id-badge">
                  #{order._id.slice(0, 4)}...{order._id.slice(-4)}
                </span>
                {renderStatusPill(order)}
              </div>

              <div className="order-mobile-row">
                <span className="order-mobile-label">Customer:</span>
                <span className="fw-semibold">{order.user?.name || "Customer"}</span>
              </div>

              <div className="order-mobile-row">
                <span className="order-mobile-label">Items:</span>
                <div>
                  <span>{order.products[0]?.description}</span>
                  {order.products.length > 1 && (
                    <div
                      className="order-items-more-link"
                      onClick={() => {
                        setSelectedItems(order.products);
                        setShowItemsPopup(true);
                      }}
                    >
                      +{order.products.length - 1} more items
                    </div>
                  )}
                </div>
              </div>

              <div className="order-mobile-row">
                <span className="order-mobile-label">Delivery:</span>
                <span>{renderDeliveryBadge(order.deliveryType)}</span>
              </div>

              <div className="order-mobile-row">
                <span className="order-mobile-label">Date:</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="order-mobile-footer">
                <div>
                  <div className="small text-muted">Total Amount</div>
                  <div className="order-amount-cell">
                    {formatPrice(
                      order.totalAmount ||
                        order.products.reduce(
                          (acc, product) => acc + product.amount,
                          0
                        ) * 1.18
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="order-btn-view"
                  onClick={() => handleViewOrder(order._id)}
                >
                  <i className="far fa-eye"></i>
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))
        ) : loading ? (
          <div className="lead-loading-state">
            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
            <span>Loading orders...</span>
          </div>
        ) : (
          <div className="order-empty-state">
            <div className="order-empty-icon">
              <i className="fas fa-box-open"></i>
            </div>
            <h6 className="order-empty-title">No orders found</h6>
          </div>
        )}
      </div>

      {/* Pagination / Load More */}
      {orders && orders.length > 0 && !endReached && (
        <div className="d-flex justify-content-center py-3">
          <button
            type="button"
            className="order-load-more-btn"
            onClick={() => setPage(page + 1)}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <i className="fas fa-arrow-down"></i>
                <span>Load More Orders</span>
              </>
            )}
          </button>
        </div>
      )}

      {endReached && orders.length > 0 && (
        <div className="text-center py-3">
          <span className="small text-muted fst-italic">All orders loaded</span>
        </div>
      )}

      {/* Items Details Popup Modal */}
      {showItemsPopup && (
        <div className="order-modal-backdrop" onClick={() => setShowItemsPopup(false)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h5 className="order-modal-title">
                <i className="fas fa-cubes text-primary"></i>
                <span>Order Items ({selectedItems.length})</span>
              </h5>
              <button
                type="button"
                className="order-modal-close"
                onClick={() => setShowItemsPopup(false)}
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="order-modal-body">
              {selectedItems.map((item, index) => (
                <div key={index} className="order-modal-item">
                  <div className="order-modal-num">{index + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="fw-semibold">{item.description}</div>
                    {item.amount ? (
                      <div className="small text-muted">{formatPrice(item.amount)}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderList;
