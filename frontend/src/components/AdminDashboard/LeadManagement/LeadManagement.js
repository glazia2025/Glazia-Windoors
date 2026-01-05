import React, { useEffect, useState } from "react";
import {
  MDBBadge,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCol,
  MDBRow,
  MDBSpinner,
  MDBTable,
  MDBTableBody,
  MDBTableHead,
  MDBTypography,
  MDBInput,
} from "mdb-react-ui-kit";
import api, { BASE_API_URL } from "../../../utils/api";
import "./LeadManagement.css";

const statusOptions = ["new", "contacted", "closed"];

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
    if (!window.confirm("Delete this lead?")) return;
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

  return (
    <MDBCard className="mt-5">
      <MDBCardHeader className="d-flex align-items-center justify-content-between">
        <MDBTypography tag="h5" className="mb-0">
          Lead Management
        </MDBTypography>
        <MDBBtn size="sm" color="primary" onClick={fetchLeads} disabled={listLoading}>
          Refresh
        </MDBBtn>
      </MDBCardHeader>
      <MDBCardBody>
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        {listLoading ? (
          <div className="d-flex justify-content-center py-4">
            <MDBSpinner role="status" />
          </div>
        ) : (
          <MDBTable responsive hover className="lead-table">
            <MDBTableHead className="bg-light">
              <tr>
                <th>Phone</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-center">Actions</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No leads yet
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.phone}</td>
                    <td>
                      <MDBInput
                        size="sm"
                        value={lead.reason || ""}
                        onChange={(e) =>
                          updateLeadField(lead._id, "reason", e.target.value)
                        }
                        disabled={savingId === lead._id}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={lead.status || "new"}
                        onChange={(e) =>
                          updateLeadField(lead._id, "status", e.target.value)
                        }
                        disabled={savingId === lead._id}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <MDBBadge className="mt-2 text-uppercase" color="secondary">
                        {lead.status || "new"}
                      </MDBBadge>
                    </td>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td className="text-center">
                      <MDBRow className="g-2">
                        <MDBCol>
                          <MDBBtn
                            size="sm"
                            color="success"
                            onClick={() => handleSave(lead._id)}
                            disabled={savingId === lead._id}
                          >
                            {savingId === lead._id ? (
                              <MDBSpinner size="sm" role="status" />
                            ) : (
                              "Save"
                            )}
                          </MDBBtn>
                        </MDBCol>
                        <MDBCol>
                          <MDBBtn
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => handleDelete(lead._id)}
                            disabled={deletingId === lead._id}
                          >
                            {deletingId === lead._id ? (
                              <MDBSpinner size="sm" role="status" />
                            ) : (
                              "Delete"
                            )}
                          </MDBBtn>
                        </MDBCol>
                      </MDBRow>
                    </td>
                  </tr>
                ))
              )}
            </MDBTableBody>
          </MDBTable>
        )}
      </MDBCardBody>
    </MDBCard>
  );
};

export default LeadManagement;
