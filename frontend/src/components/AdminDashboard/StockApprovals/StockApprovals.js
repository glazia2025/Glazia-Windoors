import React, { useCallback, useEffect, useState } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import "./StockApprovals.css";

const labels = {
  ADD: "Add Product",
  EDIT: "Edit Quantity",
  DELETE: "Delete Product",
};

export default function StockApprovals() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(
        `${BASE_API_URL}/admin/stock-adjustment-requests?status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error("Failed to load stock requests:", err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!review || (review.decision === "REJECTED" && !reason.trim())) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      await api.patch(
        `${BASE_API_URL}/admin/stock-adjustment-requests/${review.request._id}`,
        { decision: review.decision, reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReview(null);
      setReason("");
      await load();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stock-approvals-container">
      <div className="stock-card">
        {/* Header */}
        <div className="stock-card-header">
          <div className="stock-header-left">
            <div className="stock-header-icon">
              <i className="fas fa-clipboard-check"></i>
            </div>
            <div>
              <h4 className="stock-card-title">Dealership Stock Adjustment Requests</h4>
              <p className="stock-card-subtitle">
                Review manual additions, quantity corrections, and deletions before applying to inventory
              </p>
            </div>
          </div>

          <button
            type="button"
            className="stock-btn-refresh"
            onClick={load}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="stock-toolbar">
          <div className="stock-tabs">
            <button
              type="button"
              className={`stock-tab-btn ${status === "PENDING" ? "active" : ""}`}
              onClick={() => setStatus("PENDING")}
            >
              <i className="fas fa-clock"></i>
              <span>Pending</span>
            </button>
            <button
              type="button"
              className={`stock-tab-btn ${status === "APPROVED" ? "active" : ""}`}
              onClick={() => setStatus("APPROVED")}
            >
              <i className="fas fa-check-circle"></i>
              <span>Approved</span>
            </button>
            <button
              type="button"
              className={`stock-tab-btn ${status === "REJECTED" ? "active" : ""}`}
              onClick={() => setStatus("REJECTED")}
            >
              <i className="fas fa-times-circle"></i>
              <span>Rejected</span>
            </button>
          </div>

          <div className="text-muted small">
            Showing <b>{requests.length}</b> {status.toLowerCase()} request{requests.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="small text-muted mt-2">Loading stock adjustment requests...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="stock-empty-state">
            <div className="stock-empty-icon">
              <i className="fas fa-inbox"></i>
            </div>
            <div className="stock-empty-title">No {status.toLowerCase()} stock requests</div>
            <div className="stock-empty-sub">
              {status === "PENDING"
                ? "All dealership stock adjustment requests have been reviewed."
                : `There are currently no ${status.toLowerCase()} requests in the database.`}
            </div>
          </div>
        ) : (
          <div className="stock-list-body">
            {requests.map((request) => {
              const opClass = (request.operation || "EDIT").toLowerCase();
              return (
                <article className="stock-approval-item" key={request._id}>
                  {/* Left Column: Request Details */}
                  <div className="stock-item-main">
                    <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                      <span className={`stock-op-badge ${opClass}`}>
                        <i
                          className={`fas ${
                            opClass === "add"
                              ? "fa-plus-circle"
                              : opClass === "delete"
                              ? "fa-trash-alt"
                              : "fa-pen-to-square"
                          }`}
                        ></i>
                        <span>{labels[request.operation] || request.operation}</span>
                      </span>
                      <span className="stock-req-date">
                        <i className="far fa-calendar-alt me-1"></i>
                        {new Date(request.createdAt).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h5 className="stock-product-desc">{request.description}</h5>
                    <div className="stock-product-code">{request.productId}</div>

                    {/* Quantity Comparison */}
                    <div className="d-block">
                      <div className="stock-qty-box">
                        <div className="stock-qty-step">
                          <small>Current Stock</small>
                          <b>{request.currentQuantity}</b>
                        </div>
                        <i className="fas fa-arrow-right stock-qty-arrow"></i>
                        <div className="stock-qty-step">
                          <small>
                            {request.operation === "DELETE" ? "After Deletion" : "Requested Stock"}
                          </small>
                          <b
                            style={{
                              color:
                                request.operation === "DELETE"
                                  ? "#dc2626"
                                  : request.requestedQuantity > request.currentQuantity
                                  ? "#15803d"
                                  : "#b45309",
                            }}
                          >
                            {request.requestedQuantity}
                          </b>
                        </div>
                      </div>
                    </div>

                    {/* Dealership Note */}
                    {request.requestReason && (
                      <div className="stock-note-box">
                        <b>Dealership Note:</b> {request.requestReason}
                      </div>
                    )}

                    {/* Admin Review Note */}
                    {request.reviewReason && (
                      <div className="stock-note-box admin-reason">
                        <b>Admin Decision Reason:</b> {request.reviewReason}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Dealership Info & Action Buttons */}
                  <aside className="stock-dealer-panel">
                    <div>
                      <div className="stock-dealer-header">Requesting Partner</div>
                      <div className="stock-dealer-name">
                        {request.dealership?.name || "Unknown Dealership"}
                      </div>
                      <div className="stock-dealer-meta">
                        {(request.dealership?.city || request.dealership?.state) && (
                          <div>
                            <i className="fas fa-map-marker-alt"></i>
                            <span>
                              {[request.dealership?.city, request.dealership?.state]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                        {request.dealership?.phoneNumber && (
                          <div>
                            <i className="fas fa-phone"></i>
                            <a
                              href={`tel:${request.dealership?.phoneNumber}`}
                              className="text-decoration-none text-muted"
                            >
                              {request.dealership?.phoneNumber}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons if pending */}
                    {request.status === "PENDING" && (
                      <div className="stock-actions">
                        <button
                          type="button"
                          className="stock-btn-reject"
                          onClick={() => {
                            setReview({ request, decision: "REJECTED" });
                            setReason("");
                          }}
                        >
                          <i className="fas fa-times"></i>
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          className="stock-btn-approve"
                          onClick={() => {
                            setReview({ request, decision: "APPROVED" });
                            setReason("");
                          }}
                        >
                          <i className="fas fa-check"></i>
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </aside>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Confirmation Modal */}
      {review && (
        <div className="stock-modal-backdrop" role="dialog" aria-modal="true">
          <div className="stock-modal">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-1" style={{ fontSize: "18px", fontWeight: 700 }}>
                  {review.decision === "APPROVED" ? "Approve Stock Request?" : "Reject Stock Request?"}
                </h4>
                <p className="text-muted small mb-0">
                  {review.request.description} · {labels[review.request.operation]}
                </p>
              </div>
              <button
                type="button"
                className="stock-modal-close"
                onClick={() => setReview(null)}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                {review.decision === "REJECTED"
                  ? "Reason for rejection (Required) *"
                  : "Admin note for dealership (Optional)"}
              </label>
              <textarea
                className="form-control"
                rows="4"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={
                  review.decision === "REJECTED"
                    ? "Explain why this stock adjustment request cannot be approved..."
                    : "Add any explanatory notes for the dealership..."
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setReview(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || (review.decision === "REJECTED" && !reason.trim())}
                onClick={submit}
                className={review.decision === "APPROVED" ? "stock-btn-approve" : "stock-btn-reject"}
                style={{ flex: "none", minWidth: "140px" }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    <span>Processing...</span>
                  </>
                ) : review.decision === "APPROVED" ? (
                  <>
                    <i className="fas fa-check me-1"></i>
                    <span>Approve & Apply</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-times me-1"></i>
                    <span>Reject Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
