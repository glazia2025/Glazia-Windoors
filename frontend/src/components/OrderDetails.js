import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/common";
import {
  ORDER_DOCUMENT_OPTIONS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_LONG_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_LONG_LABELS,
} from "../enums/constants";
import ConfirmActionModal from "./ConfirmActionModal/ConfirmActionModal";
import PaymentProofModal from "./PaymentProofModal/PaymentProofModal";
import UploadPaymentProofModal from "./UploadPaymentProofModal/UploadPaymentProofModal";
import EditPaymentDueDateModal from "./EditPaymentDueDateModal/EditPaymentDueDateModal";
import CompleteOrderModal from "./CompleteOrderModal/CompleteOrderModal";
import "./OrderManagement.css";

const OrderDetails = () => {
  const [userRole, setUserRole] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [activeTab, setActiveTab] = useState("orderInfo");
  const [showConfirmActionModal, setShowConfirmActionModal] = useState(undefined);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(undefined);
  const [showEditPaymentDueDateModal, setShowEditPaymentDueDateModal] = useState(undefined);
  const [showUploadPaymentProofModal, setShowUploadPaymentProofModal] = useState(undefined);
  const [showCompleteOrderModal, setShowCompleteOrderModal] = useState(undefined);

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
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      let params = {
        limit: 10,
        page: 1,
        sortOrder: "desc",
        sortKey: "createdAt",
        filters: { orderId: orderId },
        needDocuments: true,
      };
      const response = await api.get("/user/getOrders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });
      const data = response.data;
      const ordersList = data.orders ? data.orders : (Array.isArray(data) ? data : []);
      if (ordersList.length > 0) {
        setOrderDetails(ordersList[0]);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
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
      new Date(orderDetails.payments[1].dueDate).getTime() > new Date().getTime()
    );
  };

  const checkOrderSecondPaymentOverdue = () => {
    return (
      orderDetails &&
      orderDetails.payments &&
      orderDetails.payments.length === 2 &&
      !orderDetails.payments[1].proofAdded &&
      new Date(orderDetails.payments[1].dueDate).getTime() <= new Date().getTime()
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

  const getOrderStatusKey = () => {
    if (!orderDetails) return ORDER_STATUS.LOADING;
    if (checkOrderFirstApprovalPending()) return ORDER_STATUS.FIRST_APPROVAL_PENDING;
    if (checkOrderSecondPaymentPending()) return ORDER_STATUS.SECOND_PAYMENT_PENDING;
    if (checkOrderSecondPaymentOverdue()) return ORDER_STATUS.SECOND_PAYMENT_OVERDUE;
    if (checkOrderSecondApprovalPending()) return ORDER_STATUS.SECOND_APPROVAL_PENDING;
    if (checkOrderDispatchPending()) return ORDER_STATUS.DISPATCH_PENDING;
    return ORDER_STATUS.COMPLETED;
  };

  const getOrderStatusLabel = () => {
    return ORDER_STATUS_LABELS[getOrderStatusKey()];
  };

  const getOrderStatusLongLabel = () => {
    return ORDER_STATUS_LONG_LABELS[getOrderStatusKey()];
  };

  const renderOrderStatusPill = () => {
    const key = getOrderStatusKey();
    let variant = "status-default";
    let dotColor = "#64748b";

    if (key === ORDER_STATUS.COMPLETED) {
      variant = "status-completed";
      dotColor = "#10B981";
    } else if (key === ORDER_STATUS.SECOND_PAYMENT_OVERDUE) {
      variant = "status-overdue";
      dotColor = "#EF4444";
    } else if (
      key === ORDER_STATUS.FIRST_APPROVAL_PENDING ||
      key === ORDER_STATUS.SECOND_APPROVAL_PENDING ||
      key === ORDER_STATUS.SECOND_PAYMENT_PENDING
    ) {
      variant = "status-proof";
      dotColor = "#F59E0B";
    } else if (key === ORDER_STATUS.DISPATCH_PENDING) {
      variant = "status-dispatch";
      dotColor = "#3B82F6";
    }

    return (
      <span className={`order-status-pill ${variant}`}>
        <span className="order-status-dot" style={{ backgroundColor: dotColor }}></span>
        <span>{getOrderStatusLabel()}</span>
      </span>
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

  const getPaymentStatusKey = (payment) => {
    if (!payment) return PAYMENT_STATUS.LOADING;
    if (checkPaymentProofPending(payment)) return PAYMENT_STATUS.PROOF_PENDING;
    if (checkPaymentProofOverdue(payment)) return PAYMENT_STATUS.PROOF_OVERDUE;
    if (checkPaymentApprovalPending(payment)) return PAYMENT_STATUS.APPROVAL_PENDING;
    return PAYMENT_STATUS.APPROVED;
  };

  const renderPaymentStatusPill = (payment) => {
    const status = getPaymentStatusKey(payment);
    let variant = "status-default";
    let dotColor = "#64748b";

    if (status === PAYMENT_STATUS.APPROVED) {
      variant = "status-completed";
      dotColor = "#10B981";
    } else if (status === PAYMENT_STATUS.PROOF_OVERDUE) {
      variant = "status-overdue";
      dotColor = "#EF4444";
    } else if (status === PAYMENT_STATUS.APPROVAL_PENDING || status === PAYMENT_STATUS.PROOF_PENDING) {
      variant = "status-proof";
      dotColor = "#F59E0B";
    }

    return (
      <span className={`order-status-pill ${variant}`}>
        <span className="order-status-dot" style={{ backgroundColor: dotColor }}></span>
        <span>{PAYMENT_STATUS_LABELS[status]}</span>
      </span>
    );
  };

  const getPaymentInfo = (payment) => {
    if (!payment || !payment._id || !orderDetails || !orderDetails.payments) {
      return "First Installment";
    }
    const foundIndex = orderDetails.payments.findIndex((p) => p._id === payment._id);
    return foundIndex === 0 ? "First Installment (Advance)" : "Final Installment (Balance)";
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
    if (data.payment.cycle === 1 && !data.finalPaymentDueDate) {
      toast.error("Final payment due date not found");
      return;
    }
    if (data.payment.cycle === 2 && data.payment.isApproved) {
      if (!data.driverInfo || !data.eWayBill || !data.taxInvoice) {
        toast.error("Driver info, EWay bill, and Tax Invoice are required");
        return;
      }
    }

    try {
      const token = localStorage.getItem("authToken");
      await api.post(
        `/admin/approve-payment`,
        {
          orderId: orderDetails._id,
          paymentId: paymentId,
          finalPaymentDueDate: data.finalPaymentDueDate,
          depositedAmount: data.depositedAmount,
          driverInfo: data.driverInfo,
          eWayBill: data.eWayBill,
          taxInvoice: data.taxInvoice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Payment approved successfully");
      fetchOrderDetails();
      cb && cb();
      setShowPaymentProofModal(undefined);
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment");
    }
  };

  const updatePaymentDueDate = async (paymentId, data, cb) => {
    if (!orderDetails || !orderDetails._id || !paymentId) {
      toast.error("Order or payment not found");
      return;
    }
    if (!data.dueDate) {
      toast.error("New due date is required");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await api.post(
        `/admin/update-payment-due-date`,
        {
          orderId: orderDetails._id,
          paymentId: paymentId,
          dueDate: data.dueDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Due date updated successfully");
      fetchOrderDetails();
      cb && cb();
      setShowEditPaymentDueDateModal(undefined);
    } catch (error) {
      console.error("Error updating due date:", error);
      toast.error("Failed to update due date");
    }
  };

  const openPaymentProofModal = (payment) => {
    setShowPaymentProofModal({
      payment,
      title: "Review Payment Proof",
      message: (
        <span>
          Uploaded on{" "}
          <strong>
            {new Date(payment.createdAt || orderDetails.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </strong>{" "}
          for the amount of <strong>{formatPrice(payment.amount)}</strong>.
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
          Current due date:{" "}
          <strong>
            {new Date(payment.dueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </strong>
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
          Upload the bank payment proof for the installment of{" "}
          <strong>{formatPrice(payment.amount)}</strong>.
        </span>
      ),
      onClose: () => setShowUploadPaymentProofModal(undefined),
      onConfirm: (data, cb) => uploadPaymentProof(payment._id, data, cb),
    });
  };

  const openCompleteOrderModal = () => {
    setShowCompleteOrderModal({
      order: orderDetails,
      title: "Complete Order & Release Dispatch",
      message: <span>Upload dispatch documentation and driver contact details.</span>,
      onClose: () => setShowCompleteOrderModal(undefined),
      onConfirm: (data, cb) => completeOrder(data, cb),
    });
  };

  const uploadPaymentProof = async (paymentId, data, cb) => {
    try {
      const token = localStorage.getItem("authToken");
      await api.post(
        `/user/upload-payment-proof`,
        {
          orderId: orderDetails._id,
          paymentId: paymentId,
          proof: data.proof,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Payment proof uploaded successfully");
      fetchOrderDetails();
      cb && cb();
      setShowUploadPaymentProofModal(undefined);
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      toast.error("Failed to upload payment proof");
    }
  };

  const completeOrder = async (data, cb) => {
    if (!orderDetails || !orderDetails._id) {
      toast.error("Order not found");
      return;
    }
    if (!data.driverInfo || !data.biltyDoc || !data.eWayBill || !data.taxInvoice) {
      toast.error("Please fill in driver details and provide all documents");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await api.post(
        `/admin/complete-order`,
        {
          orderId: orderDetails._id,
          driverInfo: data.driverInfo,
          biltyDoc: data.biltyDoc,
          eWayBill: data.eWayBill,
          taxInvoice: data.taxInvoice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Order marked as complete and dispatched!");
      fetchOrderDetails();
      cb && cb();
      setShowCompleteOrderModal(undefined);
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Failed to complete order");
    }
  };

  const openViewDocumentModal = (doc) => {
    if (!orderDetails || !orderDetails[doc.value]) {
      toast.info("Document not available yet");
      return;
    }
    const docData = orderDetails[doc.value];
    if (typeof docData === "string" && docData.startsWith("http")) {
      window.open(docData, "_blank");
    } else if (typeof docData === "string" && docData.startsWith("data:")) {
      const win = window.open();
      if (win) {
        win.document.write(
          '<iframe src="' +
            docData +
            '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
        );
      }
    } else {
      window.open(docData, "_blank");
    }
  };

  const goBack = () => {
    if (userRole === "admin") {
      navigate("/dashboard/orders");
    } else {
      navigate("/user/orders");
    }
  };

  const renderDeliveryTypeBadge = (type) => {
    switch (type) {
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
            <span>Standard Shipping</span>
          </span>
        );
    }
  };

  return (
    <div className="order-mgmt-container">
      {/* Back Button */}
      <button type="button" className="order-details-back-btn" onClick={goBack}>
        <i className="fas fa-arrow-left"></i>
        <span>Back to Orders</span>
      </button>

      {/* Main Order Card */}
      <div className="order-mgmt-card">
        {/* Order Details Top Header */}
        <div className="order-details-header">
          <div>
            <div className="order-details-title-row">
              <span className="order-id-badge" style={{ fontSize: "13px", padding: "4px 10px" }}>
                #{orderDetails?._id?.slice(0, 6)}...{orderDetails?._id?.slice(-4)}
              </span>
              <h3 className="order-details-title">
                {orderDetails ? `Order for ${orderDetails.user?.name || "Customer"}` : "Order Details"}
              </h3>
              {orderDetails && renderOrderStatusPill()}
            </div>

            {orderDetails && (
              <div className="order-details-meta">
                <span className="order-details-meta-item">
                  <i className="far fa-calendar-alt text-muted"></i>
                  <span>
                    Placed on{" "}
                    {new Date(orderDetails.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </span>
                <span className="order-details-meta-item">
                  <i className="fas fa-map-marker-alt text-muted"></i>
                  <span>{orderDetails.user?.city || "Location N/A"}</span>
                </span>
                <span className="order-details-meta-item">
                  <i className="fas fa-phone-alt text-muted"></i>
                  <span>{orderDetails.user?.phoneNumber || "Phone N/A"}</span>
                </span>
              </div>
            )}
          </div>

          {userRole === "admin" && checkOrderDispatchPending() && (
            <button
              type="button"
              className="order-btn-complete"
              onClick={openCompleteOrderModal}
            >
              <i className="fas fa-check-circle"></i>
              <span>Complete Order</span>
            </button>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        {orderDetails && (
          <div className="order-metrics-grid">
            <div className="order-metric-card">
              <div className="order-metric-icon-wrap metric-amount">
                <i className="fas fa-rupee-sign"></i>
              </div>
              <div>
                <div className="order-metric-label">Total Order Value</div>
                <div className="order-metric-value">
                  {formatPrice(
                    orderDetails.totalAmount ||
                      orderDetails.products?.reduce((acc, p) => acc + p.amount, 0) * 1.18
                  )}
                </div>
                <div className="order-metric-sub">Including 18% GST</div>
              </div>
            </div>

            <div className="order-metric-card">
              <div className="order-metric-icon-wrap metric-delivery">
                <i className="fas fa-truck"></i>
              </div>
              <div>
                <div className="order-metric-label">Delivery Mode</div>
                <div className="order-metric-value" style={{ fontSize: "14px" }}>
                  {orderDetails.deliveryType === "SELF"
                    ? "Self Pickup"
                    : orderDetails.deliveryType === "FULL"
                    ? "Full Truck Dispatch"
                    : "Part Truck Dispatch"}
                </div>
                <div className="order-metric-sub">
                  {orderDetails.driverInfo?.name
                    ? `Driver: ${orderDetails.driverInfo.name}`
                    : "Glazia Logistics"}
                </div>
              </div>
            </div>

            <div className="order-metric-card">
              <div className="order-metric-icon-wrap metric-customer">
                <i className="fas fa-user-tie"></i>
              </div>
              <div>
                <div className="order-metric-label">Client Details</div>
                <div className="order-metric-value" style={{ fontSize: "14px" }}>
                  {orderDetails.user?.name || "Customer"}
                </div>
                <div className="order-metric-sub">
                  {orderDetails.user?.phoneNumber || "Contact verified"}
                </div>
              </div>
            </div>

            <div className="order-metric-card">
              <div className="order-metric-icon-wrap metric-status">
                <i className="fas fa-sync-alt"></i>
              </div>
              <div>
                <div className="order-metric-label">Order Progress</div>
                <div className="order-metric-value" style={{ fontSize: "14px" }}>
                  {getOrderStatusLabel()}
                </div>
                <div className="order-metric-sub">
                  {orderDetails.isComplete ? "Delivered & Complete" : "In Fulfillment"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="order-details-tabs-bar">
          <button
            type="button"
            className={`order-detail-tab-btn ${activeTab === "orderInfo" ? "active" : ""}`}
            onClick={() => setActiveTab("orderInfo")}
          >
            <i className="fas fa-list-alt"></i>
            <span>Order Items</span>
            <span className="order-tab-badge">{orderDetails?.products?.length || 0}</span>
          </button>
          <button
            type="button"
            className={`order-detail-tab-btn ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            <i className="fas fa-credit-card"></i>
            <span>Payment Schedule</span>
            <span className="order-tab-badge">{orderDetails?.payments?.length || 0}</span>
          </button>
          <button
            type="button"
            className={`order-detail-tab-btn ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => {
              if (orderDetails && orderDetails.isComplete) {
                setActiveTab("documents");
              } else {
                toast.info("Documents unlock once the order is marked complete and dispatched");
              }
            }}
            style={{ opacity: orderDetails?.isComplete ? 1 : 0.6 }}
          >
            <i className={orderDetails?.isComplete ? "fas fa-file-alt" : "fas fa-lock"}></i>
            <span>Documents & Dispatch</span>
            {orderDetails?.isComplete && <span className="order-tab-badge">3</span>}
          </button>
        </div>

        {/* Tab 1: Order Items & Configuration */}
        {activeTab === "orderInfo" && orderDetails && (
          <div className="order-details-body">
            <div className="order-section-title">
              <span>Configured Items in this Order</span>
              <span className="small text-muted fw-normal">
                {orderDetails.products?.length || 0} unique specifications
              </span>
            </div>

            <div className="order-table-wrapper">
              <table className="order-main-table">
                <thead>
                  <tr>
                    <th style={{ width: "6%" }}>#</th>
                    <th style={{ width: "50%" }}>Product Specification & Description</th>
                    <th style={{ width: "14%", textAlign: "center" }}>Quantity</th>
                    <th style={{ width: "15%", textAlign: "right" }}>Unit Amount</th>
                    <th style={{ width: "15%", textAlign: "right" }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.products?.map((product, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="fw-semibold text-muted">{idx + 1}</span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{product.description || "Window/Door Item"}</div>
                        <div className="small text-muted">ID: {product.productId}</div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="order-id-badge">{product.quantity}</span>
                      </td>
                      <td style={{ textAlign: "right" }} className="text-muted">
                        {formatPrice(product.amount / (product.quantity || 1))}
                      </td>
                      <td style={{ textAlign: "right" }} className="order-amount-cell">
                        {formatPrice(product.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Summary Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "18px",
                paddingTop: "16px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ minWidth: "260px" }}>
                <div className="d-flex justify-content-between py-1 text-muted small">
                  <span>Subtotal (Products):</span>
                  <span className="fw-semibold">
                    {formatPrice(
                      orderDetails.products?.reduce((acc, p) => acc + p.amount, 0) || 0
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1 text-muted small">
                  <span>GST (18%):</span>
                  <span className="fw-semibold">
                    {formatPrice(
                      (orderDetails.products?.reduce((acc, p) => acc + p.amount, 0) || 0) * 0.18
                    )}
                  </span>
                </div>
                <div
                  className="d-flex justify-content-between py-2 fw-bold text-dark"
                  style={{ borderTop: "1px dashed #cbd5e1", fontSize: "15px" }}
                >
                  <span>Grand Total:</span>
                  <span className="text-primary" style={{ color: "#0f172a" }}>
                    {formatPrice(
                      orderDetails.totalAmount ||
                        (orderDetails.products?.reduce((acc, p) => acc + p.amount, 0) || 0) * 1.18
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Payments */}
        {activeTab === "payments" && orderDetails && (
          <div className="order-details-body">
            {/* Status Highlight Banner */}
            <div
              className={`order-status-banner ${
                checkOrderSecondPaymentOverdue()
                  ? "banner-amber"
                  : checkOrderFirstApprovalPending() || checkOrderSecondApprovalPending()
                  ? "banner-blue"
                  : "banner-green"
              }`}
            >
              <div className="order-status-banner-left">
                <i
                  className={`fas order-status-banner-icon ${
                    checkOrderSecondPaymentOverdue()
                      ? "fa-triangle-exclamation"
                      : checkOrderFirstApprovalPending() || checkOrderSecondApprovalPending()
                      ? "fa-hourglass-half"
                      : "fa-circle-check"
                  }`}
                ></i>
                <div className="order-status-banner-text">
                  <h6>{getOrderStatusLongLabel()}</h6>
                  <p>
                    {checkOrderFirstApprovalPending()
                      ? "User has submitted payment proof for advance installment. Admin review is pending."
                      : checkOrderSecondApprovalPending()
                      ? "Final installment proof uploaded. Pending admin confirmation to release dispatch."
                      : checkOrderSecondPaymentOverdue()
                      ? "Final installment is currently overdue. Please contact customer."
                      : "Installment payments are up to date."}
                  </p>
                </div>
              </div>
            </div>

            <div className="order-section-title">
              <span>Installment Payment Schedule</span>
              <span className="small text-muted fw-normal">
                {orderDetails.payments?.length || 0} stage milestones
              </span>
            </div>

            <div className="order-table-wrapper">
              <table className="order-main-table">
                <thead>
                  <tr>
                    <th style={{ width: "12%" }}>Payment ID</th>
                    <th style={{ width: "20%" }}>Installment Stage</th>
                    <th style={{ width: "14%" }}>Status</th>
                    <th style={{ width: "13%" }}>Created Date</th>
                    <th style={{ width: "13%" }}>Due Date</th>
                    <th style={{ width: "12%" }}>Amount</th>
                    <th style={{ width: "8%", textAlign: "center" }}>Proof</th>
                    <th style={{ width: "10%", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.payments?.map((payment, idx) => (
                    <tr key={payment._id || idx}>
                      <td>
                        <span className="order-id-badge">
                          #{payment._id?.slice(0, 4)}...{payment._id?.slice(-4)}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{getPaymentInfo(payment)}</span>
                        <div className="small text-muted">Cycle #{payment.cycle || idx + 1}</div>
                      </td>
                      <td>{renderPaymentStatusPill(payment)}</td>
                      <td>
                        <div className="order-date-cell">
                          <i className="far fa-calendar"></i>
                          <span>
                            {new Date(payment.createdAt || orderDetails.createdAt).toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="order-date-cell">
                          <i className="far fa-clock"></i>
                          <span>
                            {payment.dueDate
                              ? new Date(payment.dueDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Upon dispatch"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="order-amount-cell">{formatPrice(payment.amount)}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {payment.proofAdded ? (
                          <button
                            type="button"
                            className="order-btn-view"
                            style={{ padding: "4px 10px", fontSize: "11.5px" }}
                            onClick={() => openPaymentProofModal(payment)}
                          >
                            <i className="fas fa-file-invoice"></i>
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-muted small">No Proof</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {userRole === "admin" ? (
                          checkPaymentApprovalPending(payment) ? (
                            <button
                              type="button"
                              className="order-btn-view"
                              style={{
                                backgroundColor: "#1e293b",
                                color: "#ffffff",
                                borderColor: "#1e293b",
                              }}
                              onClick={() => openPaymentProofModal(payment)}
                            >
                              <i className="fas fa-check"></i>
                              <span>Approve</span>
                            </button>
                          ) : checkPaymentHasDueDate(payment) ? (
                            <button
                              type="button"
                              className="order-btn-view"
                              onClick={() => openEditPaymentDueDateModal(payment)}
                            >
                              <i className="far fa-calendar-alt"></i>
                              <span>Edit Due Date</span>
                            </button>
                          ) : (
                            <span className="text-muted small">No actions</span>
                          )
                        ) : userRole === "user" ? (
                          checkPaymentProofOverdue(payment) ? (
                            <button
                              type="button"
                              className="order-btn-complete"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                              onClick={() => openUploadPaymentProofModal(payment)}
                            >
                              <i className="fas fa-upload"></i>
                              <span>Upload Proof</span>
                            </button>
                          ) : checkPaymentProofPending(payment) ? (
                            <span className="text-muted small">Not due yet</span>
                          ) : (
                            <span className="text-muted small">Completed</span>
                          )
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Documents & Dispatch */}
        {activeTab === "documents" && orderDetails && (
          <div className="order-details-body">
            {orderDetails.driverInfo && (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "18px",
                  marginBottom: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div>
                  <div className="small text-muted fw-bold text-uppercase">
                    Assigned Dispatch Driver
                  </div>
                  <div className="h5 fw-bold text-dark mt-1 mb-1">
                    {orderDetails.driverInfo.name || "Driver Unassigned"}
                  </div>
                  <div className="small text-muted">
                    {orderDetails.driverInfo.description || "Vehicle info N/A"}
                  </div>
                </div>

                {orderDetails.driverInfo.phone && (
                  <a
                    href={`tel:${orderDetails.driverInfo.phone}`}
                    className="order-btn-view"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="fas fa-phone-volume text-success"></i>
                    <span>Call Driver: {orderDetails.driverInfo.phone}</span>
                  </a>
                )}
              </div>
            )}

            <div className="order-section-title">
              <span>Official Shipment Documentation</span>
              <span className="small text-muted fw-normal">Certified PDF / Scans</span>
            </div>

            <div className="order-docs-grid">
              {ORDER_DOCUMENT_OPTIONS.map((doc, idx) => {
                const docContent = orderDetails[doc.value];
                const hasDoc = !!docContent;
                const isImg = typeof docContent === "string" && docContent.startsWith("data:image");
                const sizeKb = hasDoc ? (docContent.length / 1024).toFixed(1) : "0";

                return (
                  <div key={idx} className="order-doc-card">
                    <div>
                      <div className="order-doc-header">
                        <div className="order-doc-icon">
                          <i className={isImg ? "far fa-file-image" : "far fa-file-pdf"}></i>
                        </div>
                        <div>
                          <h6 className="order-doc-name">{doc.label}</h6>
                          <p className="order-doc-size">
                            {hasDoc ? `${isImg ? "Image Format" : "PDF Document"} • ${sizeKb} KB` : "Document Pending"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="order-doc-btn"
                      disabled={!hasDoc}
                      onClick={() => openViewDocumentModal(doc)}
                      style={{ opacity: hasDoc ? 1 : 0.5, cursor: hasDoc ? "pointer" : "not-allowed" }}
                    >
                      <i className="fas fa-external-link-alt"></i>
                      <span>{hasDoc ? "Open Document" : "Not Available"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Modals */}
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
    </div>
  );
};

export default OrderDetails;
