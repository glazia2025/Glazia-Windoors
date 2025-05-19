import React, { useEffect, useState, useRef } from "react";
import {
  MDBBtn,
  MDBCol,
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBIcon,
  MDBInput,
  MDBRow,
  MDBSpinner,
  MDBTypography,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatPrice } from "../utils/common";
import { MIN_SEARCH_TIME, SORT_KEY_OPTIONS } from "../enums/constants";

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

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleLimitChange = (limit) => {
    setLimit(limit);
  };

  const handleFilterChange = (filter) => {
    setFilters(filter);
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

      if (selectedStatus && selectedStatus !== "all") {
        params.filters.orderType = selectedStatus;
      }

      const response = await api.get("/user/getOrders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });
      console.log("response", response.data);

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

  return (
    <MDBRow>
      <MDBCol>
        <MDBRow className="d-flex justify-content-between align-items-center mb-5">
          <MDBCol className="flex-grow-1">
            <MDBTypography tag="h3" className="mb-0">
              Pending Orders
            </MDBTypography>
          </MDBCol>
          <MDBCol className="flex-grow-0">
            <div
              className="d-flex"
              style={{ width: "max-content", gap: "10px" }}
            >
              {/* add two buttons here, one for filters and one for sorting */}
              <div className="d-flex">
                <MDBInput
                  label="Search"
                  type="search"
                  placeholder="Search by item name"
                  size="lg"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  className="placeholder-text-muted"
                />
                {/* <MDBBtn
                  color="secondary"
                  size="lg"
                  className="flex-shrink-0 d-flex align-items-center gap-2 mx-0 px-3 text-primary"
                >
                  Search{" "}
                  <MDBIcon fas icon="search" className="small text-primary" />
                </MDBBtn> */}
              </div>

              <div className="d-flex align-items-center justify-content-end">
                <MDBDropdown>
                  <MDBDropdownToggle
                    tag="a"
                    className="nav-link d-flex align-items-center btn btn-primary text-white px-3"
                    style={{ cursor: "pointer" }}
                  >
                    <span className="fw-semibold me-2">Sort by</span>
                  </MDBDropdownToggle>
                  <MDBDropdownMenu className="p-0" responsive="end">
                    {SORT_KEY_OPTIONS.map((option) => (
                      <MDBDropdownItem
                        className="py-0 px-0 fw-bold"
                        link
                        onClick={() => handleSort(option.value)}
                      >
                        <span>{option.label}</span>
                      </MDBDropdownItem>
                    ))}
                  </MDBDropdownMenu>
                </MDBDropdown>
              </div>
            </div>
          </MDBCol>
        </MDBRow>

        {orders && orders.length ? (
          <MDBRow className="row-cols-1 row-cols-1 g-2">
            <MDBCol>
              <MDBRow className="align-items-center justify-content-between w-100 px-3 fw-bold mb-1">
                <MDBCol className="col-1">
                  <span className="text-muted small">Order ID</span>
                </MDBCol>
                <MDBCol className="col-4">
                  <span className="text-muted small">Items</span>
                </MDBCol>
                <MDBCol className="col-2">
                  <span className="text-muted small">Order Date</span>
                </MDBCol>
                <MDBCol className="col-2">
                  <span className="text-muted small">Order Amount</span>
                </MDBCol>
                <MDBCol className="col-1">
                  <span className="text-muted small">Status</span>
                </MDBCol>
                <MDBCol className="col-1">
                  <span className="text-muted small">Actions</span>
                </MDBCol>
              </MDBRow>
            </MDBCol>
          </MDBRow>
        ) : (
          <></>
        )}

        <MDBRow className="row-cols-1 row-cols-1 g-2">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <MDBCol key={order._id}>
                <MDBRow className="align-items-center justify-content-between w-100 bg-white p-3 rounded-3 shadow-2">
                  <MDBCol className="col-1">
                    <MDBTypography tag="p" className="mb-0 small">
                      #{order._id.slice(0, 4)}...{order._id.slice(-4)}
                    </MDBTypography>
                  </MDBCol>
                  <MDBCol className="col-4">
                    <MDBTypography tag="p" className="mb-0 fs-6 fw-semibold">
                      {order.products[0].description}
                      {order.products.length > 1 &&
                        ` + ${order.products.length - 1} more`}
                    </MDBTypography>
                  </MDBCol>

                  <MDBCol className="col-2">
                    <MDBTypography tag="p" className="mb-0 small fw-normal">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </MDBTypography>
                  </MDBCol>
                  <MDBCol className="col-2">
                    <MDBTypography tag="p" className="mb-0 small fw-semibold">
                      {formatPrice(
                        order.totalAmount ||
                          order.products.reduce(
                            (acc, product) => acc + product.amount,
                            0
                          ) * 1.18
                      )}
                    </MDBTypography>
                  </MDBCol>
                  <MDBCol className="col-1 d-flex align-items-center justify-content-start">
                    {order.isComplete ? (
                      <div className="bg-success text-white px-2 rounded-3 small fw-semibold">
                        Completed
                      </div>
                    ) : (
                      <div className="bg-warning text-white px-2  rounded-3 small fw-semibold">
                        Pending
                      </div>
                    )}
                  </MDBCol>
                  <MDBCol
                    onClick={() => handleViewOrder(order._id)}
                    className="col-1"
                  >
                    <MDBBtn>View</MDBBtn>
                  </MDBCol>
                </MDBRow>
              </MDBCol>
            ))
          ) : loading ? (
            <MDBCol className="align-items-center justify-content-center w-100 bg-white px-3 py-4 rounded-3 shadow-2">
              <MDBTypography
                tag="p"
                className="mb-0 fs-6 text-muted text-center"
              >
                Loading orders...
              </MDBTypography>
            </MDBCol>
          ) : (
            <MDBCol className="align-items-center justify-content-center w-100 bg-white px-3 py-4 rounded-3 shadow-2">
              <MDBTypography
                tag="p"
                className="mb-0 fs-6 text-muted text-center"
              >
                No{selectedStatus === "ongoing" ? " ongoing" : " completed"}{" "}
                orders found..
              </MDBTypography>
            </MDBCol>
          )}

          {orders && orders.length > 0 ? (
            endReached ? (
              <MDBCol className="d-flex justify-content-center align-items-center py-3">
                <MDBTypography
                  tag="p"
                  className="mb-0 small text-muted text-center fst-italic"
                >
                  No more orders
                </MDBTypography>
              </MDBCol>
            ) : (
              <MDBCol className="d-flex justify-content-center align-items-center py-3">
                <MDBBtn
                  onClick={() => {
                    if (!endReached) setPage(page + 1);
                  }}
                >
                  Load more
                </MDBBtn>
              </MDBCol>
            )
          ) : (
            <></>
          )}
        </MDBRow>
      </MDBCol>
    </MDBRow>
  );
};

export default OrderList;
