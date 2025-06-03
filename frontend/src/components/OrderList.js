import React, { useEffect, useState, useRef } from "react";
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

  const renderOrderStatusSmallPill = (order) => {
    return (
      <MDBCol className="px-0 d-flex">
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
      </MDBCol>
    );
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
              </div>
            </div>
          </MDBCol>
        </MDBRow>

        <div className="table-responsive">
          {orders && orders.length > 0 ? (
            <table
              className="table table-custom small-height-table"
              style={{ maxWidth: "100%" }}
            >
              <thead className="row-cols-1 row-cols-1 g-2">
                <tr className="align-items-center justify-content-between w-100 px-3 fw-bold mb-1">
                  <td className="">
                    <span className="text-muted small">Order ID</span>
                  </td>
                  <td className="">
                    <span className="text-muted small">Items</span>
                  </td>
                  <td className="">
                    <span className="text-muted small">Status</span>
                  </td>
                  <td className="">
                    <span className="text-muted small">Order Date</span>
                  </td>
                  <td className="">
                    <span className="text-muted small">Order Amount</span>
                  </td>
                  <td className="">
                    <span className="text-muted small">Actions</span>
                  </td>
                </tr>
              </thead>
              <tbody>
                {orders.map((orderDetails, orderIndex) => (
                  <tr
                    key={orderIndex}
                    className={`align-items-center justify-content-between bg-light`}
                  >
                    <td className="">
                      <MDBTypography tag="p" className="mb-0 small">
                        #{orderDetails._id.slice(0, 4)}...
                        {orderDetails._id.slice(-4)}
                      </MDBTypography>
                    </td>
                    <td className="">
                      <MDBTypography
                        tag="p"
                        className="mb-0 fs-6 fw-semibold text-dark"
                      >
                        {orderDetails.products[0].description}
                        {orderDetails.products.length > 1 &&
                          ` + ${orderDetails.products.length - 1} more`}
                      </MDBTypography>
                    </td>

                    <td className="">
                      {renderOrderStatusSmallPill(orderDetails)}
                    </td>

                    <td className="">
                      <MDBTypography tag="p" className="mb-0 small fw-normal">
                        {new Date(orderDetails.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </MDBTypography>
                    </td>
                    <td className="">
                      <MDBTypography
                        tag="p"
                        className="mb-0 small fw-bold text-dark"
                      >
                        {formatPrice(
                          orderDetails.totalAmount ||
                            orderDetails.products.reduce(
                              (acc, product) => acc + product.amount,
                              0
                            ) * 1.18
                        )}
                      </MDBTypography>
                    </td>
                    <td className="">
                      <MDBBtn onClick={() => handleViewOrder(orderDetails._id)}>
                        View
                      </MDBBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : loading ? (
            <MDBCol
              className="d-flex align-items-center justify-content-center w-100 bg-white px-3 py-4 rounded-3 shadow-2"
              style={{ minHeight: "100px" }}
            >
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
        </div>
      </MDBCol>
    </MDBRow>
  );
};

export default OrderList;
