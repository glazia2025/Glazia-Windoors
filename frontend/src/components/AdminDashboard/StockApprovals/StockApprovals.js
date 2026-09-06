import React, { useCallback, useEffect, useState } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import "./StockApprovals.css";

const labels = { ADD: "Add product", EDIT: "Edit quantity", DELETE: "Delete product" };

export default function StockApprovals() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [review, setReview] = useState(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    const response = await api.get(`${BASE_API_URL}/admin/stock-adjustment-requests?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
    setRequests(response.data.requests || []);
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!review || (review.decision === "REJECTED" && !reason.trim())) return;
    const token = localStorage.getItem("authToken");
    await api.patch(`${BASE_API_URL}/admin/stock-adjustment-requests/${review.request._id}`, { decision: review.decision, reason: reason.trim() }, { headers: { Authorization: `Bearer ${token}` } });
    setReview(null); setReason(""); await load();
  };

  return <div className="stock-approvals container py-4">
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><h2 className="mb-1">Dealership stock requests</h2><p className="text-muted mb-0">Review manual additions, quantity corrections and deletions before they affect stock.</p></div><select className="form-select approval-filter" value={status} onChange={event => setStatus(event.target.value)}><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></div>
    {requests.length === 0 ? <div className="empty-approvals">No {status.toLowerCase()} stock requests.</div> : <div className="approval-list">{requests.map(request => <article className="approval-card" key={request._id}><div className="approval-main"><div className="d-flex align-items-center gap-2 mb-2"><span className={`operation operation-${request.operation.toLowerCase()}`}>{labels[request.operation]}</span><span className="request-date">{new Date(request.createdAt).toLocaleString("en-IN")}</span></div><h5 className="mb-1">{request.description}</h5><p className="product-code mb-3">{request.productId}</p><div className="quantity-change"><span><small>Current</small><b>{request.currentQuantity}</b></span><i className="fas fa-arrow-right"/><span><small>{request.operation === "DELETE" ? "After deletion" : "Requested"}</small><b>{request.requestedQuantity}</b></span></div>{request.requestReason && <p className="request-note mb-0"><b>Dealership note:</b> {request.requestReason}</p>}{request.reviewReason && <p className="review-note mb-0"><b>Admin reason:</b> {request.reviewReason}</p>}</div><aside className="dealer-info"><small>DEALERSHIP</small><b>{request.dealership?.name || "Unknown dealership"}</b><span>{request.dealership?.city}, {request.dealership?.state}</span><span>{request.dealership?.phoneNumber}</span>{request.status === "PENDING" && <div className="d-flex gap-2 mt-3"><button className="btn btn-outline-danger btn-sm" onClick={() => { setReview({ request, decision: "REJECTED" }); setReason(""); }}>Reject</button><button className="btn btn-success btn-sm" onClick={() => { setReview({ request, decision: "APPROVED" }); setReason(""); }}>Approve</button></div>}</aside></article>)}</div>}
    {review && <div className="approval-modal-backdrop"><div className="approval-modal" role="dialog" aria-modal="true"><div className="d-flex justify-content-between align-items-start mb-3"><div><h4 className="mb-1">{review.decision === "APPROVED" ? "Approve stock request?" : "Reject stock request?"}</h4><p className="text-muted mb-0">{review.request.description} · {labels[review.request.operation]}</p></div><button className="modal-close" onClick={() => setReview(null)} aria-label="Close">×</button></div><label className="form-label">{review.decision === "REJECTED" ? "Reason for rejection *" : "Admin note (optional)"}</label><textarea className="form-control" rows="4" value={reason} onChange={event => setReason(event.target.value)} placeholder={review.decision === "REJECTED" ? "Explain why this request cannot be approved" : "Add a note for the dealership"}/><div className="d-flex justify-content-end gap-2 mt-4"><button className="btn btn-light" onClick={() => setReview(null)}>Cancel</button><button disabled={review.decision === "REJECTED" && !reason.trim()} onClick={submit} className={`btn ${review.decision === "APPROVED" ? "btn-success" : "btn-danger"}`}>{review.decision === "APPROVED" ? "Approve and apply" : "Reject request"}</button></div></div></div>}
  </div>;
}
