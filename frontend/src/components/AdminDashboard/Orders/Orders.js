import {
  MDBCard,
  MDBCardBody,
  MDBCardFooter,
  MDBCardHeader,
  MDBCardImage,
  MDBCol,
  MDBContainer,
  MDBProgress,
  MDBProgressBar,
  MDBRow,
  MDBTypography,
} from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/orderSlice.js";
import { DEFAULT_ORDER_LIST_QUERY_PARAMS } from "../../../enums/constants.js";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  const [queryParams, setQueryParams] = useState(
    DEFAULT_ORDER_LIST_QUERY_PARAMS
  );

  useEffect(() => {
    dispatch(fetchOrders(queryParams));
    console.log("ord", orders);
  }, [queryParams]);

  return (
    <section
      className="h-100 gradient-custom"
      style={{ backgroundColor: "#eee" }}
    >
      <MDBContainer className="py-5 h-100">
        <MDBRow className="justify-content-center align-items-center h-100">
          <MDBCol lg="10" xl="8">
            <MDBCard style={{ borderRadius: "10px" }}>
              <MDBCardHeader className="px-4 py-5">
                <MDBTypography tag="h5" className="text-muted mb-0">
                  View <span style={{ color: "#3b71ca" }}>Orders</span>!
                </MDBTypography>
              </MDBCardHeader>
              <MDBCardBody className="p-4">
                {/* Render orders */}
                {orders?.length > 0 &&
                  orders.map((order) => (
                    <MDBCard key={order._id} className="shadow-0 border mb-4">
                      <MDBCardBody>
                        {order.products.map((product) => (
                          <MDBRow key={product._id}>
                            <MDBCol className="d-flex align-items-center">
                              <p className="text-muted mb-0">
                                {product.productId}
                              </p>
                            </MDBCol>
                            <MDBCol className="d-flex align-items-center">
                              <p className="text-muted mb-0 small">
                                {product.description ||
                                  product.perticular ||
                                  "N.A"}
                              </p>
                            </MDBCol>
                            <MDBCol className="d-flex align-items-center">
                              <p className="text-muted mb-0 small">
                                Qty: {product.quantity}
                              </p>
                            </MDBCol>
                            <MDBCol className="d-flex align-items-center">
                              <p className="text-muted mb-0 small">
                                Amount: {product.amount}
                              </p>
                            </MDBCol>
                          </MDBRow>
                        ))}
                        <hr
                          className="mb-4"
                          style={{ backgroundColor: "#e0e0e0", opacity: 1 }}
                        />
                        <MDBRow className="align-items-center">
                          <MDBCol>
                            <p
                              className="mb-0 small"
                              style={{ color: "#386bc0" }}
                            >
                              {order.user.name}
                            </p>
                          </MDBCol>
                          <MDBCol>
                            <div className="d-flex justify-content-around mb-1">
                              <p
                                className="mt-1 mb-0 small"
                                style={{ color: "#386bc0" }}
                              >
                                Contact - {order.user.phoneNumber}
                              </p>
                              <p
                                className="mt-1 mb-0 small"
                                style={{ color: "#386bc0" }}
                              >
                                {order.user.city}
                              </p>
                            </div>
                          </MDBCol>
                        </MDBRow>
                      </MDBCardBody>
                    </MDBCard>
                  ))}
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
};

export default Orders;
