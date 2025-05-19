import React, { useEffect, useState } from "react";
import {
  MDBBtn,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRow,
  MDBTooltip,
  MDBTypography,
} from "mdb-react-ui-kit";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/common";

const CompletedOrders = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");
        let params = {
          limit: 10,
          page: 1,
          sortOrder: "desc",
          sortKey: "createdAt",
          filters: { orderType: "completed" },
        };
        const response = await api.get("/user/getOrders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        });
        console.log("response", response.data);
        setCompletedOrders(response.data);
      } catch (error) {
        console.error("Error fetching completed orders:", error);
      }
    };
    fetchCompletedOrders();
  }, []);

  const handleViewOrder = (orderId) => {
    console.log("Viewing order:", orderId);
    navigate(`/user/orders/${orderId}`);
  };

  return (
    <MDBRow>
      <MDBCol>
        <MDBTypography tag="h3" className="mb-5">
          Completed Orders
        </MDBTypography>

        {completedOrders && completedOrders.length ? (
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
          {completedOrders && completedOrders.length > 0 ? (
            completedOrders.map((order) => (
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
                        order.products.reduce(
                          (acc, product) => acc + product.amount,
                          0
                        )
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
                        Ongoing
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
          ) : (
            <MDBCol className="align-items-center justify-content-center w-100 bg-white px-3 py-4 rounded-3 shadow-2">
              <MDBTypography
                tag="p"
                className="mb-0 fs-6 text-muted text-center"
              >
                No completed orders found..
              </MDBTypography>
            </MDBCol>
          )}
        </MDBRow>
      </MDBCol>
    </MDBRow>
  );
};

export default CompletedOrders;
