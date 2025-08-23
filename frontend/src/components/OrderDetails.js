import React, { useEffect, useState } from "react";
import {
  MDBBreadcrumb,
  MDBBtn,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRipple,
  MDBRow,
  MDBTooltip,
  MDBTypography,
} from "mdb-react-ui-kit";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/common";
import {
  ORDER_DOCUMENT_OPTIONS,
  ORDER_STATUS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_LONG_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_LONG_LABELS,
} from "../enums/constants";
import ConfirmActionModal from "./ConfirmActionModal/ConfirmActionModal";
import PaymentProofModal from "./PaymentProofModal/PaymentProofModal";
import UploadPaymentProofModal from "./UploadPaymentProofModal/UploadPaymentProofModal";
import EditPaymentDueDateModal from "./EditPaymentDueDateModal/EditPaymentDueDateModal";
import CompleteOrderModal from "./CompleteOrderModal/CompleteOrderModal";

const OrderDetails = () => {
  const [userRole, setUserRole] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [activeTab, setActiveTab] = useState("orderInfo");
  const [showConfirmActionModal, setShowConfirmActionModal] =
    useState(undefined);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(undefined);
  const [showEditPaymentDueDateModal, setShowEditPaymentDueDateModal] =
    useState(undefined);
  const [showUploadPaymentProofModal, setShowUploadPaymentProofModal] =
    useState(undefined);
  const [showCompleteOrderModal, setShowCompleteOrderModal] =
    useState(undefined);
  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
      if (window.gtag) {
        window.gtag("event", "order_detail", {
          page_path: window.location.pathname,
        });
      }
    }, [window]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      let params = {
        // orderType: "ongoing",
        limit: 10,
        page: 1,
        sortOrder: "desc",
        sortKey: "createdAt",
        filters: { orderId: orderId },
        needDocuments: true
      };
      const response = await api.get("/user/getOrders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });
      console.log("response", response.data);
      if (response.data.length > 0) {
        setOrderDetails(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching ongoing orders:", error);
    }
  };

  const handleViewOrder = (orderId) => {
    console.log("Viewing order:", orderId);
    navigate(`/user/orders/${orderId}`);
  };

  //   const getOrderTitle = (name) => {
  //     return "Viewing Order for " + name.split(" ")[0];
  //   };

  const getOrderTitle = (name) => {
    return "View Order";
  };

  const checkOrderFirstApprovalPending = () => {
    return (
      orderDetails &&
      orderDetails.payments &&
      orderDetails.payments.length === 1 &&
      !orderDetails.payments[0].isApproved
    );
  };

  const checkOrderLatestPaymentPending = () => {
    return (
      orderDetails &&
      orderDetails.payments &&
      orderDetails.payments.length > 0 &&
      !orderDetails.payments[orderDetails.payments.length - 1].isApproved
    );
  };

  const checkOrderSecondPaymentPending = () => {
    return (
      orderDetails &&
      orderDetails.payments &&
      orderDetails.payments.length === 2 &&
      !orderDetails.payments[1].proofAdded &&
      new Date(orderDetails.payments[1].dueDate).getTime() >
        new Date().getTime()
    );
  };

  const checkOrderSecondPaymentOverdue = () => {
    return (
      orderDetails &&
      orderDetails.payments &&
      orderDetails.payments.length === 2 &&
      !orderDetails.payments[1].proofAdded &&
      new Date(orderDetails.payments[1].dueDate).getTime() <=
        new Date().getTime()
    );
  };

  const checkOrderSecondApprovalPending = () => {
    return (
      orderDetails &&
      orderDetails.payments &&
      orderDetails.payments.length === 2 &&
      orderDetails.payments[1].proofAdded &&
      !orderDetails.payments[1].isApproved
    );
  };

  const checkOrderDispatchPending = () => {
    return (
      orderDetails &&
      orderDetails.payments &&
      orderDetails.payments.length === 2 &&
      orderDetails.payments[1].proofAdded &&
      orderDetails.payments[1].isApproved &&
      !orderDetails.isComplete
    );
  };

  const getOrderStatus = () => {
    if (!orderDetails) {
      return ORDER_STATUS.LOADING;
    }
    if (checkOrderFirstApprovalPending()) {
      return ORDER_STATUS.FIRST_APPROVAL_PENDING;
    }
    if (checkOrderSecondPaymentPending()) {
      return ORDER_STATUS.SECOND_PAYMENT_PENDING;
    }
    if (checkOrderSecondPaymentOverdue()) {
      return ORDER_STATUS.SECOND_PAYMENT_OVERDUE;
    }
    if (checkOrderSecondApprovalPending()) {
      return ORDER_STATUS.SECOND_APPROVAL_PENDING;
    }
    if (checkOrderDispatchPending()) {
      return ORDER_STATUS.DISPATCH_PENDING;
    }
    return ORDER_STATUS.COMPLETED;
  };

  const getOrderStatusLabel = () => {
    return ORDER_STATUS_LABELS[getOrderStatus()];
  };

  const getOrderStatusLongLabel = () => {
    return ORDER_STATUS_LONG_LABELS[getOrderStatus()];
  };

  const getOrderStatusColor = () => {
    return ORDER_STATUS_COLORS[getOrderStatus()];
  };

  const renderOrderStatusPills = () => {
    return (
      <MDBCol className="px-0">
        <MDBTooltip
          tag="span"
          wrapperClass="d-inline-block"
          placement="bottom"
          title={getOrderStatusLongLabel()}
        >
          <MDBRipple
            className={`${getOrderStatusColor()} rounded-5 px-3 py-1 small fw-bold text-transform-none lowercase`}
          >
            {getOrderStatusLongLabel()}
          </MDBRipple>
        </MDBTooltip>
      </MDBCol>
    );
  };

  const renderOrderStatusSmallPill = () => {
    return (
      <MDBCol className="px-0">
        <MDBTooltip
          tag="span"
          wrapperClass="d-inline-block"
          placement="bottom"
          title={getOrderStatusLabel()}
        >
          <MDBRipple
            className={`${getOrderStatusColor()} rounded-5 px-2 small fw-bold text-transform-none lowercase`}
          >
            {getOrderStatusLabel()}
          </MDBRipple>
        </MDBTooltip>
      </MDBCol>
    );
  };

  const checkPaymentProofPending = (payment) => {
    return (
      payment &&
      !payment.proofAdded &&
      new Date(payment.dueDate).getTime() > new Date().getTime()
    );
  };

  const checkPaymentProofOverdue = (payment) => {
    return (
      payment &&
      !payment.proofAdded &&
      new Date(payment.dueDate).getTime() <= new Date().getTime()
    );
  };

  const checkPaymentApprovalPending = (payment) => {
    return payment && payment.proofAdded && !payment.isApproved;
  };

  const checkPaymentHasDueDate = (payment) => {
    return payment && !payment.proofAdded && !!payment.dueDate;
  };

  const getPaymentStatus = (payment) => {
    if (!payment) {
      return PAYMENT_STATUS.LOADING;
    }
    if (checkPaymentProofPending(payment)) {
      return PAYMENT_STATUS.PROOF_PENDING;
    }
    if (checkPaymentProofOverdue(payment)) {
      return PAYMENT_STATUS.PROOF_OVERDUE;
    }
    if (checkPaymentApprovalPending(payment)) {
      return PAYMENT_STATUS.APPROVAL_PENDING;
    }

    return PAYMENT_STATUS.APPROVED;
  };

  const getPaymentStatusLabel = (payment) => {
    return PAYMENT_STATUS_LABELS[getPaymentStatus(payment)];
  };

  const getPaymentStatusLongLabel = (payment) => {
    return PAYMENT_STATUS_LONG_LABELS[getPaymentStatus(payment)];
  };

  const getPaymentStatusColor = (payment) => {
    return PAYMENT_STATUS_COLORS[getPaymentStatus(payment)];
  };

  const renderPaymentStatusPills = (payment) => {
    return (
      <MDBCol className="px-0">
        <MDBTooltip
          tag="span"
          wrapperClass="d-inline-block"
          placement="bottom"
          title={getPaymentStatusLongLabel(payment)}
        >
          <MDBRipple
            className={`${getPaymentStatusColor(
              payment
            )} rounded-5 px-3 py-1 small fw-bold text-transform-none lowercase`}
          >
            {getPaymentStatusLongLabel(payment)}
          </MDBRipple>
        </MDBTooltip>
      </MDBCol>
    );
  };

  const renderPaymentStatusSmallPill = (payment) => {
    return (
      <MDBCol className="px-0">
        <MDBTooltip
          tag="span"
          wrapperClass="d-inline-block"
          placement="bottom"
          title={getPaymentStatusLabel(payment)}
        >
          <MDBRipple
            className={`${getPaymentStatusColor(
              payment
            )} rounded-5 px-2 small fw-bold text-transform-none lowercase`}
          >
            {getPaymentStatusLabel(payment)}
          </MDBRipple>
        </MDBTooltip>
      </MDBCol>
    );
  };

  const getPaymentInfo = (payment) => {
    if (!payment || !payment._id || !orderDetails || !orderDetails.payments) {
      return "First Installment";
    }
    const foundIndex = orderDetails.payments.findIndex(
      (p) => p._id === payment._id
    );
    return foundIndex === 0 ? "First Installment" : "Second Installment";
  };

  const approvePayment = async (paymentId, data, cb) => {
    if (!orderDetails || !orderDetails._id) {
      toast.error("Order not found");
      return;
    }
    if (!paymentId) {
      toast.error("Payment ID not found");
      return;
    }
    if (data.payment.cycle === 1) {
      if (!data.finalPaymentDueDate) {
        toast.error("Final payment due date not found");
        return;
      }
    }
    if (data.payment.cycle === 2 && data.payment.isApproved) {
      if (!data.driverInfo) {
        toast.error("Driver information not found");
        return;
      }
      if (!data.eWayBill) {
        toast.error("EWay Bill not found");
        return;
      }
      if (!data.taxInvoice) {
        toast.error("Tax Invoice not found");
        return;
      }
    }

    if (!userRole || userRole !== "admin") {
      toast.error("You are not authorized to approve payments");
      return;
    }
    if (orderDetails.isComplete) {
      toast.error("Order is already completed");
      return;
    }
    if (orderDetails.payments.length === 0) {
      toast.error("Order has no payments");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await api.post(
        `/admin/approve-payment`,
        {
          orderId: orderDetails._id,
          paymentId: paymentId,
          finalPaymentDueDate: data.finalPaymentDueDate,
          driverInfo: data.driverInfo,
          eWayBill: data.eWayBill,
          taxInvoice: data.taxInvoice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response", response);

      fetchOrderDetails();
      cb && cb();

      setShowPaymentProofModal(undefined);
    } catch (error) {
      console.error("Error approving payment:", error);
    }
  };

  const updatePaymentDueDate = async (paymentId, data, cb) => {
    if (!orderDetails || !orderDetails._id) {
      toast.error("Order not found");
      return;
    }
    if (!paymentId) {
      toast.error("Payment ID not found");
      return;
    }

    if (!data.dueDate) {
      toast.error("Payment new due date not found");
      return;
    }

    if (!userRole || userRole !== "admin") {
      toast.error("You are not authorized to approve payments");
      return;
    }
    if (orderDetails.isComplete) {
      toast.error("Order is already completed");
      return;
    }
    if (orderDetails.payments.length === 0) {
      toast.error("Order has no payments");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await api.post(
        `/admin/update-payment-due-date`,
        {
          orderId: orderDetails._id,
          paymentId: paymentId,
          dueDate: data.dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response", response);

      fetchOrderDetails();
      cb && cb();

      setShowEditPaymentDueDateModal(undefined);
    } catch (error) {
      console.error("Error approving payment:", error);
    }
  };

  const openPaymentProofModal = (payment) => {
    setShowPaymentProofModal({
      payment,
      title: "View Payment Proof",
      message: (
        <span>
          {"Uploaded on " +
            new Date(
              payment.createdAt || orderDetails.createdAt
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
          for amount of <strong>{formatPrice(payment.amount)}</strong>
        </span>
      ),
      onClose: () => setShowPaymentProofModal(undefined),
      onConfirm: (data, cb) => approvePayment(payment._id, data, cb),
    });
  };

  const openEditPaymentDueDateModal = (payment) => {
    setShowEditPaymentDueDateModal({
      payment,
      title: "Edit Due Date",
      message: (
        <span>
          {"Due on " +
            new Date(payment.dueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </span>
      ),
      onClose: () => setShowEditPaymentDueDateModal(undefined),
      onConfirm: (data, cb) => updatePaymentDueDate(payment._id, data, cb),
    });
  };

  const openUploadPaymentProofModal = (payment) => {
    setShowUploadPaymentProofModal({
      payment,
      title: "Upload Payment Proof",
      message: (
        <span>
          Upload the payment proof for the final payment of{" "}
          <strong>{formatPrice(payment.amount)}</strong> to complete the order.
        </span>
      ),
      onClose: () => setShowUploadPaymentProofModal(undefined),
      onConfirm: (data, cb) => uploadPaymentProof(payment._id, data, cb),
    });
  };

  const openCompleteOrderModal = () => {
    setShowCompleteOrderModal({
      order: orderDetails,
      title: "Complete Order",
      message: <span>Upload all final documents to complete the order.</span>,
      onClose: () => setShowCompleteOrderModal(undefined),
      onConfirm: (data, cb) => completeOrder(data, cb),
    });
  };

  const uploadPaymentProof = async (paymentId, data, cb) => {
    console.log("uploading payment proof", paymentId, data);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.post(
        `/user/upload-payment-proof`,
        {
          orderId: orderDetails._id,
          paymentId: paymentId,
          proof: data.proof,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response", response);
      fetchOrderDetails();
      cb && cb();
      setShowUploadPaymentProofModal(undefined);
    } catch (error) {
      console.error("Error uploading payment proof:", error);
    }
  };

  const completeOrder = async (data, cb) => {
    if (!orderDetails || !orderDetails._id) {
      toast.error("Order not found");
      return;
    }

    if (!data.driverInfo) {
      toast.error("Driver information not found");
      return;
    }
    if (!data.biltyDoc) {
      toast.error("Bilty Document not found");
      return;
    }
    if (!data.eWayBill) {
      toast.error("EWay Bill not found");
      return;
    }
    if (!data.taxInvoice) {
      toast.error("Tax Invoice not found");
      return;
    }

    if (!userRole || userRole !== "admin") {
      toast.error("You are not authorized to approve payments");
      return;
    }
    if (orderDetails.isComplete) {
      toast.error("Order is already completed");
      return;
    }
    if (orderDetails.payments.length === 0) {
      toast.error("Order has no payments");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await api.post(
        `/admin/complete-order`,
        {
          orderId: orderDetails._id,
          driverInfo: data.driverInfo,
          biltyDoc: data.biltyDoc,
          eWayBill: data.eWayBill,
          taxInvoice: data.taxInvoice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response", response);

      fetchOrderDetails();
      cb && cb();

      setShowCompleteOrderModal(undefined);
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  const deliveryTypeLabel = (deliveryType) => {
      switch (deliveryType) {
        case "SELF":
          return <MDBTypography tag="p" className="mb-0 small">Self Pickup</MDBTypography>;
        case "FULL":
          return <MDBTypography tag="p" className="mb-0 small">Full Truck</MDBTypography>;
        case "PART":
          return <MDBTypography tag="p" className="mb-0 small">Part Truck</MDBTypography>;
        default:
          return null;
      }
    };
  

  const openViewDocumentModal = () => {};

  const goBack = () => {
    if (userRole === "admin") {
      navigate("/admin/dashboard/orders");
    } else {
      navigate("/user/orders");
    }
  };

  return (
    <>
      <MDBRow className="pdf-row-wrapper">
        <MDBCol className="main-selectors" style={{ minWidth: "70%" }}>
          <MDBRow className="d-flex align-items-center justify-content-start gap-3 mb-4">
            <MDBCol className="col-auto px-0 mx-0">
              <MDBBtn
                className="small mx-0 mb-0 mt-0 border-0 bg-transparent d-flex align-items-center gap-2 text-muted hover:text-primary"
                color={"light"}
                size={"sm"}
                onClick={goBack}
              >
                <MDBIcon
                  icon="arrow-left"
                  className="text-muted mf-normal"
                  style={{ fontSize: "0.8rem" }}
                />
                Go Back
              </MDBBtn>
            </MDBCol>
            <MDBCol className="col-auto px-0 mx-0">
              <MDBTypography tag="h4" className="mb-0 fw-bold">
                {orderDetails ? getOrderTitle(orderDetails.user.name) : "Order"}
              </MDBTypography>
            </MDBCol>
          </MDBRow>

          <MDBRow className="d-flex align-items-start justify-content-start gap-2 mb-5">
            <MDBCol className="col-auto px-0">
              <MDBBtn
                color={activeTab === "orderInfo" ? "primary" : "light"}
                onClick={() => setActiveTab("orderInfo")}
                className=""
              >
                Order Info
              </MDBBtn>
            </MDBCol>
            <MDBCol className="col-auto px-0">
              <MDBBtn
                color={activeTab === "payments" ? "primary" : "light"}
                onClick={() => setActiveTab("payments")}
                className=""
              >
                Payments
              </MDBBtn>
            </MDBCol>
            <MDBCol className="col-auto px-0">
              <MDBTooltip
                tag="span"
                wrapperClass="d-inline-block"
                placement="bottom"
                title={
                  orderDetails && orderDetails.isComplete
                    ? "Documents are available"
                    : "Documents will be available after the order is completed"
                }
              >
                <MDBBtn
                  disabled={!orderDetails || !orderDetails.isComplete}
                  color={activeTab === "documents" ? "primary" : "light"}
                  onClick={() => setActiveTab("documents")}
                  className="d-flex align-items-center gap-2"
                >
                  Documents{" "}
                  {orderDetails && orderDetails.isComplete ? (
                    <MDBIcon
                      icon="check-circle"
                      className="small text-success"
                    />
                  ) : (
                    <MDBIcon icon="lock" className="small text-muted" />
                  )}
                </MDBBtn>
              </MDBTooltip>
            </MDBCol>
          </MDBRow>

          {/* <div className="border-top border-muted mt-4"></div> */}

          {activeTab === "orderInfo" && (
            <MDBCol>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <MDBTypography tag="h5" className="mb-2 fw-semibold">
                    Order Status
                  </MDBTypography>
                  {/* add pills for order status */}

                  {renderOrderStatusPills()}
                </div>

                {userRole === "admin" && checkOrderDispatchPending() ? (
                  <div>
                    <MDBBtn
                      onClick={openCompleteOrderModal}
                      size={"lg"}
                      className="fw-semibold fs-6"
                    >
                      <MDBIcon fas icon="check-circle" className="me-2" />
                      Complete Order
                    </MDBBtn>
                  </div>
                ) : (
                  <></>
                )}
              </div>

              <MDBCol className="px-0 mb-4">
                <MDBTypography tag="p" className="mb-3 text-muted small mt-3">
                  {"Here are the details of the order."}
                </MDBTypography>
              </MDBCol>

              <div className="table-responsive">
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
                        <span className="text-muted small">Delivery Type</span>
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
                    </tr>
                  </thead>

                  {orderDetails && orderDetails._id ? (
                    <tbody>
                      <tr
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
                          {deliveryTypeLabel(orderDetails.deliveryType)}
                        </td>

                        <td className="">{renderOrderStatusSmallPill()}</td>

                        <td className="">
                          <MDBTypography
                            tag="p"
                            className="mb-0 small fw-normal"
                          >
                            {new Date(
                              orderDetails.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
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
                      </tr>
                    </tbody>
                  ) : (
                    <></>
                  )}
                </table>
              </div>
            </MDBCol>
          )}

          {activeTab === "payments" &&
            orderDetails &&
            orderDetails.payments &&
            orderDetails.payments.length > 0 && (
              <MDBCol>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <MDBTypography tag="h5" className="mb-2 fw-semibold">
                      Payment Status
                    </MDBTypography>
                    {/* add pills for order status */}

                    {renderPaymentStatusPills(
                      orderDetails.payments[orderDetails.payments.length - 1]
                    )}
                  </div>

                  {userRole === "admin" && checkOrderDispatchPending() ? (
                    <div>
                      <MDBBtn
                        onClick={openCompleteOrderModal}
                        size={"lg"}
                        className="fw-semibold fs-6"
                      >
                        <MDBIcon fas icon="check-circle" className="me-2" />
                        Complete Order
                      </MDBBtn>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>

                <MDBCol className="px-0 mb-4">
                  <MDBTypography tag="p" className="mb-3 text-muted small mt-3">
                    {"Here are the payment details for this order."}
                  </MDBTypography>
                </MDBCol>

                <div className="table-responsive">
                  <table
                    className="table table-custom small-height-table"
                    style={{ maxWidth: "100%" }}
                  >
                    <thead>
                      <tr>
                        <th>
                          <span className="text-muted small">Payment ID</span>
                        </th>
                        <th>
                          <span className="text-muted small">Info</span>
                        </th>
                        <th>
                          <span className="text-muted small">Status</span>
                        </th>
                        <th>
                          <span className="text-muted small">Date</span>
                        </th>
                        <th>
                          <span className="text-muted small">Due Date</span>
                        </th>
                        <th>
                          <span className="text-muted small">Amount</span>
                        </th>
                        <th>
                          <span className="text-muted small">Proof</span>
                        </th>
                        <th>
                          <span className="text-muted small">Actions</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderDetails &&
                      orderDetails.payments &&
                      orderDetails.payments.length > 0 ? (
                        orderDetails.payments.map((payment, index) => (
                          <tr
                            key={payment._id}
                            className={`align-items-center justify-content-between ${
                              index % 2 === 0 ? "bg-light" : "bg-transparent"
                            }`}
                          >
                            <td className="">
                              <MDBTypography tag="p" className="mb-0 small">
                                #{payment._id.slice(0, 4)}...
                                {payment._id.slice(-4)}
                              </MDBTypography>
                            </td>
                            <td className="">
                              <MDBTypography
                                tag="p"
                                className="mb-0 fs-6 fw-semibold text-dark"
                              >
                                {getPaymentInfo(payment)}
                              </MDBTypography>
                            </td>

                            <td>{renderPaymentStatusSmallPill(payment)}</td>

                            <td className="">
                              <MDBTypography
                                tag="p"
                                className="mb-0 small fw-normal"
                              >
                                {new Date(
                                  payment.createdAt || orderDetails.createdAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </MDBTypography>
                            </td>
                            <td className="">
                              <MDBTypography
                                tag="p"
                                className="mb-0 small fw-normal"
                              >
                                {new Date(
                                  payment.dueDate || orderDetails.createdAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </MDBTypography>
                            </td>
                            <td className="">
                              <MDBTypography
                                tag="p"
                                className="mb-0 small fw-bold text-dark"
                              >
                                {formatPrice(payment.amount)}
                              </MDBTypography>
                            </td>
                            <td className="">
                              {!payment.proofAdded ? (
                                <div className="d-flex">
                                  <MDBTypography
                                    tag="p"
                                    className="mb-0 small fw-normal border-bottom border-dotted border-muted"
                                  >
                                    No Proof
                                  </MDBTypography>
                                </div>
                              ) : (
                                <div className="d-flex">
                                  <MDBTypography
                                    tag="p"
                                    onClick={() =>
                                      openPaymentProofModal(payment)
                                    }
                                    className="cursor-pointer mb-0 small fw-normal border-bottom border-dotted border-primary"
                                  >
                                    View Proof
                                  </MDBTypography>
                                </div>
                              )}
                            </td>
                            <td className="">
                              {userRole === "admin" ? (
                                checkPaymentApprovalPending(payment) ? (
                                  <MDBBtn
                                    color="primary"
                                    size="sm"
                                    onClick={() =>
                                      openPaymentProofModal(payment)
                                    }
                                  >
                                    Approve
                                  </MDBBtn>
                                ) : checkPaymentHasDueDate(payment) ? (
                                  <MDBBtn
                                    color="primary"
                                    size="sm"
                                    onClick={() =>
                                      openEditPaymentDueDateModal(payment)
                                    }
                                  >
                                    Edit Due Date
                                  </MDBBtn>
                                ) : (
                                  <MDBTypography
                                    tag="p"
                                    className="mb-0 small fw-normal text-muted"
                                  >
                                    No actions
                                  </MDBTypography>
                                )
                              ) : userRole === "user" ? (
                                checkPaymentProofOverdue(payment) ? (
                                  <MDBBtn
                                    color="primary"
                                    size="sm"
                                    onClick={() =>
                                      openUploadPaymentProofModal(payment)
                                    }
                                  >
                                    Upload Proof
                                  </MDBBtn>
                                ) : checkPaymentProofPending(payment) ? (
                                  <MDBTypography
                                    tag="p"
                                    className="mb-0 small fw-normal text-muted"
                                  >
                                    Not due yet
                                  </MDBTypography>
                                ) : (
                                  <div className="d-flex">
                                    <MDBTypography
                                      tag="p"
                                      className="mb-0 small fw-normal text-muted"
                                    >
                                      No actions
                                    </MDBTypography>
                                  </div>
                                )
                              ) : (
                                <></>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <></>
                      )}
                    </tbody>
                  </table>
                </div>
              </MDBCol>
            )}

          {activeTab === "documents" &&
            orderDetails &&
            orderDetails.isComplete && (
              <MDBCol>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <MDBTypography
                      tag="p"
                      className="mb-2 fw-semibold fs-6 text-muted"
                    >
                      Driver Info
                    </MDBTypography>

                    <MDBTypography tag="h4" className="mb-2 fw-bold">
                      {orderDetails.driverInfo.name}
                    </MDBTypography>

                    <MDBTypography
                      tag="p"
                      className="mb-2 fw-bold d-flex align-items-center rounded-5 border border-primary text-primary px-2"
                    >
                      <span className="fw-light text-muted small border-end border-primary pe-2 me-2">
                        Phone
                      </span>{" "}
                      {orderDetails.driverInfo.phone}
                    </MDBTypography>
                    {/* add pills for order status */}
                  </div>
                </div>

                <MDBCol className="px-0 mb-4">
                  <MDBTypography tag="p" className="mb-3 text-muted small mt-3">
                    {"Here are the final documents for this order."}
                  </MDBTypography>
                </MDBCol>

                <div className="table-responsive">
                  <table
                    className="table table-custom small-height-table"
                    style={{ maxWidth: "100%" }}
                  >
                    <thead>
                      <tr>
                        <th>
                          <span className="text-muted small">
                            Document Name
                          </span>
                        </th>
                        <th>
                          <span className="text-muted small">Type</span>
                        </th>
                        <th>
                          <span className="text-muted small">Size</span>
                        </th>
                        <th>
                          <div className="d-flex justify-content-end">
                            <span className="text-muted small">Actions</span>
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderDetails && orderDetails.isComplete ? (
                        ORDER_DOCUMENT_OPTIONS.map((doc, index) => (
                          <tr
                            key={index}
                            className={`align-items-center justify-content-between ${
                              index % 2 === 0 ? "bg-light" : "bg-transparent"
                            }`}
                          >
                            <td className="">
                              <MDBTypography
                                tag="p"
                                className="mb-0 fs-6 fw-semibold text-dark"
                              >
                                {doc.label}
                              </MDBTypography>
                            </td>

                            <td className="">
                              <MDBTypography
                                tag="p"
                                className="mb-0 small fw-normal"
                              >
                                {orderDetails[doc.value].startsWith(
                                  "data:image"
                                )
                                  ? "Image"
                                  : "PDF"}
                              </MDBTypography>
                            </td>
                            <td className="">
                              <MDBTypography
                                tag="p"
                                className="mb-0 small fw-bold text-dark"
                              >
                                {(
                                  orderDetails[doc.value].length / 1024
                                ).toFixed(2)}{" "}
                                KB
                              </MDBTypography>
                            </td>
                            <td className="">
                              <div className="d-flex justify-content-end">
                                <MDBBtn
                                  color="primary"
                                  size="sm"
                                  onClick={() => openViewDocumentModal(doc)}
                                >
                                  View
                                </MDBBtn>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <></>
                      )}
                    </tbody>
                  </table>
                </div>
              </MDBCol>
            )}
        </MDBCol>
      </MDBRow>

      <ConfirmActionModal
        isOpen={!!showConfirmActionModal}
        title={showConfirmActionModal?.title}
        message={showConfirmActionModal?.message}
        onConfirm={showConfirmActionModal?.onConfirm}
        onClose={showConfirmActionModal?.onClose}
      />

      <PaymentProofModal
        isOpen={!!showPaymentProofModal}
        title={showPaymentProofModal?.title}
        message={showPaymentProofModal?.message}
        payment={showPaymentProofModal?.payment}
        onClose={showPaymentProofModal?.onClose}
        onConfirm={showPaymentProofModal?.onConfirm}
      />

      <EditPaymentDueDateModal
        isOpen={!!showEditPaymentDueDateModal}
        title={showEditPaymentDueDateModal?.title}
        message={showEditPaymentDueDateModal?.message}
        payment={showEditPaymentDueDateModal?.payment}
        onClose={showEditPaymentDueDateModal?.onClose}
        onConfirm={showEditPaymentDueDateModal?.onConfirm}
      />

      <UploadPaymentProofModal
        isOpen={!!showUploadPaymentProofModal}
        title={showUploadPaymentProofModal?.title}
        message={showUploadPaymentProofModal?.message}
        payment={showUploadPaymentProofModal?.payment}
        onClose={showUploadPaymentProofModal?.onClose}
        onConfirm={showUploadPaymentProofModal?.onConfirm}
      />

      <CompleteOrderModal
        isOpen={!!showCompleteOrderModal}
        title={showCompleteOrderModal?.title}
        message={showCompleteOrderModal?.message}
        order={showCompleteOrderModal?.order}
        onClose={showCompleteOrderModal?.onClose}
        onConfirm={showCompleteOrderModal?.onConfirm}
      />
    </>
  );
};

export default OrderDetails;
