import React, { useEffect, useMemo, useState } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import ParterAgreement from "../../UserDetailsForm/PartnerAgreement/PartnerAgreement";
import "./UserManagement.css";

const emptyForm = {
  name: "",
  email: "",
  gstNumber: "",
  pincode: "",
  city: "",
  state: "",
  address: "",
  phoneNumber: "",
  extraPhoneNumbers: "",
  authorisedPerson: "",
  authorisedPersonDesignation: "",
};

const parseExtraNumbers = (raw) => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "US";
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showAgreement, setShowAgreement] = useState(false);
  const [paBlob, setPaBlob] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [promotionUser, setPromotionUser] = useState(null);
  const [promotionBlob, setPromotionBlob] = useState(null);
  const [promotionAccepted, setPromotionAccepted] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  const fetchUsers = async () => {
    setListLoading(true);
    setError("");
    try {
      const response = await api.get(`${BASE_API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phoneNumber?.includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.state?.toLowerCase().includes(q) ||
          u.gstNumber?.toLowerCase().includes(q) ||
          u.accountType?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "name") {
      result.sort((a, b) => {
        if (order === "asc") {
          return (a.name || "").trim().localeCompare((b.name || "").trim(), "en", { sensitivity: "base" });
        } else {
          return (b.name || "").trim().localeCompare((a.name || "").trim(), "en", { sensitivity: "base" });
        }
      });
    } else if (sortBy === "date") {
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    return result;
  }, [users, searchQuery, sortBy, order]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (showAgreement || paBlob) {
      setShowAgreement(false);
      setPaBlob(null);
    }
  };

  const handleGenerateAgreement = () => {
    if (
      !form.name ||
      !form.email ||
      !form.gstNumber ||
      !form.pincode ||
      !form.city ||
      !form.state ||
      !form.address ||
      !form.phoneNumber
    ) {
      setError("Please fill all required company and contact fields before generating agreement.");
      return;
    }

    setError("");
    setShowAgreement(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (!paBlob) {
        setError("Please generate the Partner Agreement before creating the user.");
        setFormLoading(false);
        return;
      }

      const extraNumbers = parseExtraNumbers(form.extraPhoneNumbers);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("gstNumber", form.gstNumber);
      formData.append("pincode", form.pincode);
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("address", form.address);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append("authorizedPerson", form.authorisedPerson);
      formData.append("authorizedPersonDesignation", form.authorisedPersonDesignation);

      extraNumbers.forEach((number) => formData.append("phoneNumbers", number));
      formData.append(
        "paPdf",
        new File([paBlob], "partner-agreement.pdf", {
          type: "application/pdf",
        })
      );

      await api.post(`${BASE_API_URL}/user/register`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMsg(`User "${form.name}" created and onboarded successfully!`);
      setForm(emptyForm);
      setShowAgreement(false);
      setPaBlob(null);
      setShowAddForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const promoteToDealership = async () => {
    if (!promotionUser || !promotionBlob || !promotionAccepted) return;
    setPromotionLoading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("partnerAgreementAccepted", "true");
      data.append(
        "paPdf",
        new File([promotionBlob], "glazia-dealership-agreement.pdf", {
          type: "application/pdf",
        })
      );
      await api.post(
        `${BASE_API_URL}/admin/users/${promotionUser._id}/promote-dealership`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPromotionUser(null);
      setPromotionBlob(null);
      setPromotionAccepted(false);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to promote fabricator");
    } finally {
      setPromotionLoading(false);
    }
  };

  return (
    <div className="user-mgmt-container">
      {/* Top Header Card with Quick Action to Add User */}
      <div className="user-mgmt-card">
        <div className="user-card-header">
          <div className="user-header-left">
            <div className="user-header-icon">
              <i className="fas fa-users-cog"></i>
            </div>
            <div>
              <h4 className="user-card-title">User & Partner Management</h4>
              <p className="user-card-subtitle">
                Onboard authorized partners, manage client credentials and agreements
              </p>
            </div>
          </div>

          <button
            type="button"
            className="user-toggle-form-btn"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            <i className={`fas ${showAddForm ? "fa-minus" : "fa-plus"}`}></i>
            <span>{showAddForm ? "Hide Form" : "Add New User"}</span>
          </button>
        </div>

        {/* Collapsible Add New User Form */}
        {showAddForm && (
          <div className="user-form-body">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
                <i className="fas fa-exclamation-circle"></i>
                <div>{error}</div>
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
                <i className="fas fa-check-circle"></i>
                <div>{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="user-form-grid">
                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>Company / User Name</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="e.g. Acme Windoors Ltd"
                    value={form.name}
                    onChange={handleChange("name")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>Official Email</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    className="user-form-input"
                    placeholder="e.g. contact@acme.com"
                    value={form.email}
                    onChange={handleChange("email")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>GST Identification Number</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="e.g. 06AAKCG7530J1ZE"
                    value={form.gstNumber}
                    onChange={handleChange("gstNumber")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>Primary Phone Number</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="e.g. 9876543210"
                    value={form.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>Additional Phone Numbers</span>
                    <span className="small text-muted font-normal ms-1">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="e.g. 9811002233, 9822334455"
                    value={form.extraPhoneNumbers}
                    onChange={handleChange("extraPhoneNumbers")}
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>Pincode</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="e.g. 122001"
                    value={form.pincode}
                    onChange={handleChange("pincode")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>City</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="e.g. Gurugram"
                    value={form.city}
                    onChange={handleChange("city")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>State</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="e.g. Haryana"
                    value={form.state}
                    onChange={handleChange("state")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>Authorised Person</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="Full legal name"
                    value={form.authorisedPerson}
                    onChange={handleChange("authorisedPerson")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group">
                  <label className="user-form-label">
                    <span>Authorised Designation</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="e.g. Director / Managing Partner"
                    value={form.authorisedPersonDesignation}
                    onChange={handleChange("authorisedPersonDesignation")}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="user-form-group span-full">
                  <label className="user-form-label">
                    <span>Complete Registered Address</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="user-form-input"
                    placeholder="Street, Industrial Area, Building, Landmark"
                    value={form.address}
                    onChange={handleChange("address")}
                    required
                    disabled={formLoading}
                  />
                </div>

                {/* Partner Agreement Generator */}
                <div className="user-form-group span-full">
                  <div className="user-agreement-box">
                    <div className="user-agreement-info">
                      <div className="user-agreement-icon">
                        <i className="fas fa-file-contract"></i>
                      </div>
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: "13.5px" }}>
                          Partner Agreement PDF
                        </div>
                        <div className="small text-muted">
                          {paBlob
                            ? "Partner agreement generated and ready for registration submission"
                            : "Generate customized legal agreement before submitting registration"}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className={`user-btn-agreement ${paBlob ? "ready" : ""}`}
                        disabled={formLoading}
                        onClick={handleGenerateAgreement}
                      >
                        <i className={`fas ${paBlob ? "fa-check" : "fa-gear"}`}></i>
                        <span>{paBlob ? "Agreement Ready" : "Generate Partner Agreement"}</span>
                      </button>

                      {showAgreement && (
                        <ParterAgreement
                          userName={form.name}
                          completeAddress={form.address}
                          gstNumber={form.gstNumber}
                          pincode={form.pincode}
                          city={form.city}
                          state={form.state}
                          phoneNumber={form.phoneNumber}
                          email={form.email}
                          setBlob={setPaBlob}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="user-form-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="user-btn-submit"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Registering User...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      <span>Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Registered Users Table Card */}
      <div className="user-mgmt-card">
        <div className="user-card-header">
          <div className="user-header-left">
            <div className="user-header-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <i className="fas fa-id-card"></i>
            </div>
            <div>
              <h4 className="user-card-title">Registered Clients & Partners</h4>
              <p className="user-card-subtitle">
                {users.length} authorized user accounts in database
              </p>
            </div>
          </div>

          <button
            type="button"
            className="user-btn-refresh"
            onClick={fetchUsers}
            disabled={listLoading}
          >
            <i className={`fas fa-sync-alt ${listLoading ? "fa-spin" : ""}`}></i>
            <span>Refresh</span>
          </button>
        </div>

        {/* Toolbar: Search + Sort controls */}
        <div className="user-toolbar">
          <div className="user-search-wrap">
            <i className="fas fa-search user-search-icon"></i>
            <input
              type="text"
              className="user-search-input"
              placeholder="Search by company name, email, phone, GST, city or account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="user-controls-right">
            <select
              className="user-select-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Company Name</option>
              <option value="date">Sort by Registered Date</option>
            </select>

            <select
              className="user-select-control"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value="asc">Ascending (A-Z / Oldest)</option>
              <option value="desc">Descending (Z-A / Newest)</option>
            </select>
          </div>
        </div>

        {/* User Table Body */}
        <div className="user-table-wrapper">
          {listLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="small text-muted mt-2">Loading partner directory...</div>
            </div>
          ) : (
            <table className="user-main-table">
              <thead>
                <tr>
                  <th style={{ width: "4%" }}>#</th>
                  <th style={{ width: "20%" }}>Company & Name</th>
                  <th style={{ width: "17%" }}>Email</th>
                  <th style={{ width: "12%" }}>Phone</th>
                  <th style={{ width: "11%" }}>GST Number</th>
                  <th style={{ width: "12%" }}>City / State</th>
                  <th style={{ width: "10%" }}>Registered Date</th>
                  <th style={{ width: "7%" }}>Account</th>
                  <th style={{ width: "7%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      <div className="mb-2">
                        <i className="fas fa-users-slash" style={{ fontSize: "24px", color: "#94a3b8" }}></i>
                      </div>
                      <div>No users found matching your search query.</div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user, idx) => (
                    <tr key={user._id || idx}>
                      <td>
                        <span className="text-muted fw-semibold">{idx + 1}</span>
                      </td>
                      <td>
                        <div className="user-avatar-cell">
                          <div className="user-avatar-circle">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{user.name}</div>
                            {user.authorizedPerson && (
                              <div className="small text-muted">
                                {user.authorizedPerson}
                                {user.authorizedPersonDesignation ? ` • ${user.authorizedPersonDesignation}` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <a href={`mailto:${user.email}`} className="text-dark text-decoration-none hover:text-primary">
                          {user.email}
                        </a>
                      </td>
                      <td>
                        <a href={`tel:${user.phoneNumber}`} className="text-muted text-decoration-none">
                          {user.phoneNumber}
                        </a>
                        {user.phoneNumbers?.length > 1 && (
                          <div className="small text-muted">
                            +{user.phoneNumbers.length - 1} more
                          </div>
                        )}
                      </td>
                      <td>
                        {user.gstNumber ? (
                          <span className="user-gst-badge">{user.gstNumber}</span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{user.city || "-"}</div>
                        <div className="small text-muted">{user.state || ""}</div>
                      </td>
                      <td>
                        <div className="text-muted small">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.accountType === "DEALERSHIP" ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {user.accountType || "FABRICATOR"}
                        </span>
                      </td>
                      <td>
                        {user.accountType === "FABRICATOR" ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: "11.5px", padding: "4px 8px", whiteSpace: "nowrap" }}
                            onClick={() => {
                              setPromotionUser(user);
                              setPromotionBlob(null);
                              setPromotionAccepted(false);
                            }}
                          >
                            Promote to dealership
                          </button>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {promotionUser && (
        <div className="promotion-backdrop">
          <div className="promotion-modal" role="dialog" aria-modal="true">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h4>Promote to dealership</h4>
                <p className="text-muted">{promotionUser.name} · {promotionUser.phoneNumber}</p>
              </div>
              <button
                type="button"
                className="promotion-close"
                onClick={() => setPromotionUser(null)}
              >
                ×
              </button>
            </div>
            <div className="alert alert-warning small">
              The existing Glazia–Fabricator agreement will be deleted from S3 and replaced by this Glazia–Dealership agreement.
            </div>
            <div className="promotion-agreement">
              <ParterAgreement
                agreementType="GLAZIA_DEALERSHIP"
                userName={promotionUser.name}
                completeAddress={promotionUser.address || ""}
                gstNumber={promotionUser.gstNumber}
                pincode={promotionUser.pincode || ""}
                city={promotionUser.city}
                state={promotionUser.state}
                phoneNumber={promotionUser.phoneNumber}
                email={promotionUser.email}
                setBlob={setPromotionBlob}
              />
            </div>
            <label className="d-flex align-items-start gap-2 mt-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={promotionAccepted}
                onChange={(event) => setPromotionAccepted(event.target.checked)}
              />
              <span>I confirm the dealership has reviewed and accepted the new agreement.</span>
            </label>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setPromotionUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!promotionBlob || !promotionAccepted || promotionLoading}
                onClick={promoteToDealership}
              >
                {promotionLoading ? "Promoting…" : "Promote dealership"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
