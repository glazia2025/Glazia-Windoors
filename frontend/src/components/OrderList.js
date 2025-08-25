import React, { useEffect, useState } from "react";
import {
  MDBBtn,
  MDBCol,
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBInput,
  MDBRipple,
  MDBRow,
  MDBTooltip,
  MDBTypography,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatPrice } from "../utils/common";
import { MIN_SEARCH_TIME, SORT_KEY_OPTIONS } from "../enums/constants";
import { getOrderStatusColor, getOrderStatusLabel } from "../utils/order";

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

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
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

  const handleSearchChange = (search) => {
    setPage(1);
    setEndReached(false);
    setFilters((cur) => {
      let next = { ...cur };
      if (search && search.length) {
        next.search = search;
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

  const deduplicateOrders = (orders) => {
    return orders.filter(
      (order, index, self) =>
        index === self.findIndex((t) => t._id === order._id)
    );
  };

  const handleViewOrder = (orderId) => {
    if (userRole === "admin") {
      navigate(`/admin/dashboard/orders/${orderId}`);
    } else {
      navigate(`/user/orders/${orderId}`);
    }
  };

  const deliveryTypeLabel = (deliveryType) => {
    switch (deliveryType) {
      case "SELF":
        return "Self Pickup";
      case "FULL":
        return "Full Truck";
      case "PART":
        return "Part Truck";
      default:
        return "";
    }
  };

  const renderOrderStatusSmallPill = (order) => {
    return (
      <MDBTooltip
        tag="span"
        wrapperClass="d-inline-block"
        placement="bottom"
        title={getOrderStatusLabel(order)}
      >
        <MDBRipple
          className={`${getOrderStatusColor(
            order
          )} rounded-5 px-2 small fw-bold text-transform-none lowercase`}
        >
          {getOrderStatusLabel(order)}
        </MDBRipple>
      </MDBTooltip>
    );
  };

  return (
    <MDBRow>
      <MDBCol>
        {/* Search + Sort */}
        <MDBRow className="d-flex justify-content-between align-items-center mb-4">
          <MDBCol md="6">
            <MDBInput
              label="Search"
              type="search"
              placeholder="Search by item name"
              size="lg"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              className="placeholder-text-muted"
            />
          </MDBCol>
          <MDBCol md="auto" className="mt-3 mt-md-0">
            <MDBDropdown>
              <MDBDropdownToggle
                tag="a"
                className="nav-link d-flex align-items-center btn btn-primary text-white px-3"
                style={{ cursor: "pointer" }}
              >
                <span className="fw-semibold me-2">Sort by</span>
              </MDBDropdownToggle>
              <MDBDropdownMenu className="p-0" responsive="end">
                {SORT_KEY_OPTIONS.map((option, optionIndex) => (
                  <MDBDropdownItem
                    key={optionIndex}
                    className="py-0 px-0 fw-bold"
                    link
                    onClick={() => handleSort(option.value)}
                  >
                    <span>{option.label}</span>
                  </MDBDropdownItem>
                ))}
              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBCol>
        </MDBRow>

        {/* Desktop Table View */}
        <div className="d-none d-md-block table-responsive">
          {orders && orders.length > 0 ? (
            <table className="table table-custom small-height-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Delivery Type</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Order Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="bg-light">
                    <td>#{order._id.slice(0, 4)}...{order._id.slice(-4)}</td>
                    <td>
                      {order.products[0].description}
                      {order.products.length > 1 &&
                        ` + ${order.products.length - 1} more`}
                    </td>
                    <td>{deliveryTypeLabel(order.deliveryType)}</td>
                    <td>{renderOrderStatusSmallPill(order)}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      {formatPrice(
                        order.totalAmount ||
                          order.products.reduce(
                            (acc, product) => acc + product.amount,
                            0
                          ) * 1.18
                      )}
                    </td>
                    <td>
                      <MDBBtn size="sm" onClick={() => handleViewOrder(order._id)}>
                        View
                      </MDBBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : loading ? (
            <p className="text-center text-muted">Loading orders...</p>
          ) : (
            <p className="text-center text-muted">No orders found.</p>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="d-block d-md-none">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <MDBCard key={order._id} className="mb-3 shadow-sm border-0">
                <MDBCardBody>
                  <MDBCardTitle className="fw-bold">
                    #{order._id.slice(0, 4)}...{order._id.slice(-4)}
                  </MDBCardTitle>
                  <MDBCardText>
                    <strong>Items:</strong> {order.products[0].description}
                    {order.products.length > 1 &&
                      ` + ${order.products.length - 1} more`}
                  </MDBCardText>
                  <MDBCardText>
                    <strong>Delivery Type:</strong>{" "}
                    {deliveryTypeLabel(order.deliveryType)}
                  </MDBCardText>
                  <MDBCardText>
                    <strong>Status:</strong> {renderOrderStatusSmallPill(order)}
                  </MDBCardText>
                  <MDBCardText>
                    <strong>Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </MDBCardText>
                  <MDBCardText>
                    <strong>Amount:</strong>{" "}
                    {formatPrice(
                      order.totalAmount ||
                        order.products.reduce(
                          (acc, product) => acc + product.amount,
                          0
                        ) * 1.18
                    )}
                  </MDBCardText>
                  <MDBBtn size="sm" onClick={() => handleViewOrder(order._id)}>
                    View Order
                  </MDBBtn>
                </MDBCardBody>
              </MDBCard>
            ))
          ) : loading ? (
            <p className="text-center text-muted">Loading orders...</p>
          ) : (
            <p className="text-center text-muted">No orders found.</p>
          )}
        </div>

        {/* Load More */}
        {orders && orders.length > 0 && !endReached && (
          <MDBCol className="d-flex justify-content-center align-items-center py-3">
            <MDBBtn onClick={() => setPage(page + 1)}>Load more</MDBBtn>
          </MDBCol>
        )}
        {endReached && orders.length > 0 && (
          <MDBCol className="d-flex justify-content-center align-items-center py-3">
            <MDBTypography
              tag="p"
              className="mb-0 small text-muted text-center fst-italic"
            >
              No more orders
            </MDBTypography>
          </MDBCol>
        )}
      </MDBCol>
    </MDBRow>
  );
};

export default OrderList;
