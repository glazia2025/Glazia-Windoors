import React, { useEffect, useMemo, useState } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import "./LeadManagement.css";

const statusOptions = ["new", "contacted", "closed"];
const ITEMS_PER_PAGE = 10;

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("authToken");

  const fetchLeads = async () => {
    setListLoading(true);
    setError("");
    try {
      const response = await api.get(`${BASE_API_URL}/admin/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeads(response.data.leads || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leads");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const updateLeadField = (leadId, field, value) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId ? { ...lead, [field]: value } : lead
      )
    );
  };

  const handleSave = async (leadId) => {
    const lead = leads.find((item) => item._id === leadId);
    if (!lead) return;

    setSavingId(leadId);
    setError("");
    try {
      const response = await api.put(
        `${BASE_API_URL}/admin/leads/${leadId}`,
        { status: lead.status, reason: lead.reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.lead) {
        setLeads((prev) =>
          prev.map((item) =>
            item._id === leadId ? response.data.lead : item
          )
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lead");
    } finally {
      setSavingId("");
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Delete this lead record?")) return;
    setDeletingId(leadId);
    setError("");
    try {
      await api.delete(`${BASE_API_URL}/admin/leads/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lead");
    } finally {
      setDeletingId("");
    }
  };

  // Status counts
  const counts = useMemo(() => {
    const res = { all: leads.length, new: 0, contacted: 0, closed: 0 };
    leads.forEach((l) => {
      const s = (l.status || "new").toLowerCase();
      if (res[s] !== undefined) res[s] += 1;
    });
    return res;
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === "all" ||
        (lead.status || "new").toLowerCase() === statusFilter.toLowerCase();
      if (!matchesStatus) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        lead.phone?.toLowerCase().includes(q) ||
        lead.reason?.toLowerCase().includes(q)
      );
    });
  }, [leads, statusFilter, searchTerm]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  return (
    <div className="lead-mgmt-container">
      <div className="lead-mgmt-card">
        {/* Header */}
        <div className="lead-card-header">
          <div className="lead-header-left">
            <div className="lead-header-icon">
              <i className="fas fa-address-book"></i>
            </div>
            <div>
              <h4 className="lead-card-title">Lead Management</h4>
              <p className="lead-card-subtitle">
                Track and follow up on customer inquiries, catalog requests, and prospects
              </p>
            </div>
          </div>
          <div className="lead-header-actions">
            <button
              type="button"
              className="lead-btn-refresh"
              onClick={fetchLeads}
              disabled={listLoading}
              title="Refresh leads list"
            >
              <i className={`fas fa-sync-alt ${listLoading ? "fa-spin" : ""}`}></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="alert alert-danger m-3 mb-0 d-flex align-items-center" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Status Filter Chips Bar */}
        <div className="lead-stats-bar">
          <button
            type="button"
            className={`lead-stat-chip ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            <span className="lead-stat-dot dot-all"></span>
            <span>All Leads</span>
            <span className="lead-stat-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`lead-stat-chip ${statusFilter === "new" ? "active" : ""}`}
            onClick={() => setStatusFilter("new")}
          >
            <span className="lead-stat-dot dot-new"></span>
            <span>New</span>
            <span className="lead-stat-count">{counts.new}</span>
          </button>
          <button
            type="button"
            className={`lead-stat-chip ${statusFilter === "contacted" ? "active" : ""}`}
            onClick={() => setStatusFilter("contacted")}
          >
            <span className="lead-stat-dot dot-contacted"></span>
            <span>Contacted</span>
            <span className="lead-stat-count">{counts.contacted}</span>
          </button>
          <button
            type="button"
            className={`lead-stat-chip ${statusFilter === "closed" ? "active" : ""}`}
            onClick={() => setStatusFilter("closed")}
          >
            <span className="lead-stat-dot dot-closed"></span>
            <span>Closed</span>
            <span className="lead-stat-count">{counts.closed}</span>
          </button>
        </div>

        {/* Search & Info Toolbar */}
        <div className="lead-toolbar">
          <div className="lead-search-box">
            <i className="fas fa-search lead-search-icon"></i>
            <input
              type="text"
              className="lead-search-input"
              placeholder="Search by phone number or inquiry reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="lead-search-clear"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <span className="lead-count-label">
            {filteredLeads.length === 0
              ? "0 leads"
              : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredLeads.length
                )} of ${filteredLeads.length} leads${
                  filteredLeads.length !== leads.length
                    ? ` (filtered from ${leads.length})`
                    : ""
                }`}
          </span>
        </div>

        {/* Leads Table */}
        {listLoading ? (
          <div className="lead-loading-state">
            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
            <span>Loading leads pipeline...</span>
          </div>
        ) : (
          <div className="lead-table-wrapper">
            <table className="lead-main-table">
              <thead>
                <tr>
                  <th style={{ width: "6%", textAlign: "center" }}>#</th>
                  <th style={{ width: "22%" }}>Phone Number</th>
                  <th style={{ width: "28%" }}>Inquiry Reason</th>
                  <th style={{ width: "18%" }}>Status</th>
                  <th style={{ width: "16%" }}>Date Received</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="lead-empty-state">
                        <div className="lead-empty-icon">
                          <i className="fas fa-inbox"></i>
                        </div>
                        <h6 className="lead-empty-title">No leads found</h6>
                        <p className="lead-empty-desc">
                          {searchTerm || statusFilter !== "all"
                            ? "No leads matched your current filter criteria."
                            : "New customer inquiries and catalog download leads will appear here."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead, index) => {
                    const isSaving = savingId === lead._id;
                    const isDeleting = deletingId === lead._id;
                    const currentStatus = (lead.status || "new").toLowerCase();
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                    return (
                      <tr key={lead._id}>
                        <td className="lead-index">{globalIndex}</td>
                        <td>
                          <div className="lead-phone-cell">
                            <div className="lead-phone-icon">
                              <i className="fas fa-phone-alt"></i>
                            </div>
                            <a
                              href={`tel:${lead.phone}`}
                              className="lead-phone-number"
                              title="Call this lead"
                            >
                              {lead.phone}
                            </a>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="lead-reason-input"
                            value={lead.reason || ""}
                            placeholder="Enter inquiry details / reason"
                            onChange={(e) =>
                              updateLeadField(lead._id, "reason", e.target.value)
                            }
                            disabled={isSaving || isDeleting}
                          />
                        </td>
                        <td>
                          <div className="lead-status-wrapper">
                            <select
                              className={`lead-status-select status-${currentStatus}`}
                              value={currentStatus}
                              onChange={(e) =>
                                updateLeadField(lead._id, "status", e.target.value)
                              }
                              disabled={isSaving || isDeleting}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td>
                          <div className="lead-date-cell">
                            <i className="far fa-calendar-alt"></i>
                            <span>{formatDate(lead.createdAt)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="lead-actions-cell">
                            <button
                              type="button"
                              className="lead-btn-action lead-btn-save"
                              onClick={() => handleSave(lead._id)}
                              disabled={isSaving || isDeleting}
                              title="Save lead changes"
                            >
                              {isSaving ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : (
                                <>
                                  <i className="fas fa-check"></i>
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="lead-btn-action lead-btn-delete"
                              onClick={() => handleDelete(lead._id)}
                              disabled={isSaving || isDeleting}
                              title="Delete lead"
                            >
                              {isDeleting ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : (
                                <i className="far fa-trash-alt"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!listLoading && filteredLeads.length > 0 && (
          <div className="lead-pagination-bar">
            <div className="lead-pagination-info">
              Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
              <strong>
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)}
              </strong>{" "}
              of <strong>{filteredLeads.length}</strong> leads
            </div>

            <div className="lead-pagination-controls">
              <button
                type="button"
                className="lead-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                title="Go to previous page"
              >
                <i className="fas fa-chevron-left"></i>
                <span>Previous</span>
              </button>

              <div className="lead-page-indicator">
                Page <strong>{currentPage}</strong> of <span>{totalPages || 1}</span>
              </div>

              <button
                type="button"
                className="lead-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                title="Go to next page"
              >
                <span>Next</span>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadManagement;
