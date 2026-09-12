import React, { useCallback, useEffect, useState } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import "./AdminAccounts.css";

const permissionLabels = {
  DASHBOARD: "Dashboard",
  ORDERS: "Orders",
  INVENTORY: "Inventory",
  QUOTATIONS: "Quotations",
  USERS: "Users & Dealerships",
  DYNAMIC_PRICING: "Dynamic Pricing",
  LEADS: "Lead Management",
  STOCK_APPROVALS: "Stock Approvals",
  BLOGS: "Blogs",
  ADMIN_ACCOUNTS: "Admin Accounts",
};

const permissionIcons = {
  DASHBOARD: "fa-chart-pie",
  ORDERS: "fa-shopping-bag",
  INVENTORY: "fa-boxes",
  QUOTATIONS: "fa-file-invoice-dollar",
  USERS: "fa-users",
  DYNAMIC_PRICING: "fa-sliders-h",
  LEADS: "fa-address-book",
  STOCK_APPROVALS: "fa-clipboard-check",
  BLOGS: "fa-newspaper",
  ADMIN_ACCOUNTS: "fa-user-shield",
};

const DEFAULT_PERMISSIONS = [
  "DASHBOARD",
  "ORDERS",
  "INVENTORY",
  "QUOTATIONS",
  "USERS",
  "DYNAMIC_PRICING",
  "LEADS",
  "STOCK_APPROVALS",
  "BLOGS",
  "ADMIN_ACCOUNTS",
];

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("authToken")}` });
const blank = { name: "", email: "", phoneNumber: "", permissions: [] };

export default function AdminAccounts() {
  const [admins, setAdmins] = useState([]);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`${BASE_API_URL}/admin/admin-accounts`, {
        headers: auth(),
      });
      setAdmins(response.data.admins || []);
      const serverPerms = response.data.availablePermissions?.length
        ? response.data.availablePermissions
        : DEFAULT_PERMISSIONS;
      setPermissions(serverPerms.filter((p) => p !== "PRODUCTS"));
    } catch (err) {
      console.error("Failed to load admin accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (permission) =>
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((value) => value !== permission)
        : [...current.permissions, permission],
    }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (modal.mode === "add") {
        await api.post(`${BASE_API_URL}/admin/admin-accounts`, form, {
          headers: auth(),
        });
      } else {
        await api.patch(
          `${BASE_API_URL}/admin/admin-accounts/${modal.admin._id}`,
          {
            name: form.name,
            email: form.email,
            permissions: form.permissions,
            isActive: form.isActive,
          },
          { headers: auth() }
        );
      }
      setModal(null);
      setForm(blank);
      await load();
    } catch (err) {
      console.error("Failed to save admin account:", err);
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (admin) => {
    setForm({
      name: admin.name,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      permissions: (admin.adminPermissions || []).filter((p) => p !== "PRODUCTS"),
      isActive: admin.isActive,
    });
    setModal({ mode: "edit", admin });
  };

  return (
    <div className="accounts-container">
      <div className="accounts-card">
        {/* Header */}
        <div className="accounts-card-header">
          <div className="accounts-header-left">
            <div className="accounts-header-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <div>
              <h4 className="accounts-card-title">Administrator Accounts & Access Control</h4>
              <p className="accounts-card-subtitle">
                Manage individual OTP-based administrator accounts and granular module access rights
              </p>
            </div>
          </div>

          <button
            type="button"
            className="accounts-btn-add"
            onClick={() => {
              setForm(blank);
              setModal({ mode: "add" });
            }}
          >
            <i className="fas fa-user-plus"></i>
            <span>Add Administrator</span>
          </button>
        </div>

        {/* List of Admins */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="small text-muted mt-2">Loading administrator accounts...</div>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-user-shield" style={{ fontSize: "32px", color: "#cbd5e1" }}></i>
            <h5 className="mt-3 mb-1 text-dark" style={{ fontSize: "15px", fontWeight: 600 }}>
              No administrator accounts found
            </h5>
            <p className="small text-muted">Click &quot;Add Administrator&quot; to create a new administrative profile.</p>
          </div>
        ) : (
          <div className="accounts-list-body">
            {admins.map((admin) => (
              <article key={admin._id} className="account-item-card">
                <div className="account-avatar">
                  {admin.name?.slice(0, 2).toUpperCase() || "AD"}
                </div>

                <div className="account-info">
                  <h4>{admin.name}</h4>
                  <div className="account-contact-line">
                    <a href={`tel:${admin.phoneNumber}`}>
                      <i className="fas fa-phone"></i>
                      <span>{admin.phoneNumber}</span>
                    </a>
                    <span>•</span>
                    <a href={`mailto:${admin.email}`}>
                      <i className="fas fa-envelope"></i>
                      <span>{admin.email}</span>
                    </a>
                  </div>

                  <div className="account-perms-wrap">
                    {(admin.adminPermissions || [])
                      .filter((permission) => permission !== "PRODUCTS")
                      .map((permission) => (
                      <span key={permission} className="account-perm-chip">
                        <i className={`fas ${permissionIcons[permission] || "fa-check-circle"}`}></i>
                        <span>{permissionLabels[permission] || permission}</span>
                      </span>
                    ))}
                    {!admin.adminPermissions?.length && (
                      <span className="account-perm-none">No module permissions assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className={`account-status-pill ${admin.isActive ? "active" : "disabled"}`}>
                    <i className={`fas ${admin.isActive ? "fa-check-circle" : "fa-times-circle"}`}></i>
                    <span>{admin.isActive ? "Active Account" : "Disabled"}</span>
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    className="account-btn-edit"
                    onClick={() => openEdit(admin)}
                  >
                    <i className="fas fa-pen"></i>
                    <span>Manage</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Administrator Modal */}
      {modal && (
        <div className="account-modal-backdrop" role="dialog" aria-modal="true">
          <form className="account-modal" onSubmit={save}>
            <div className="account-modal-header">
              <div>
                <h3 className="account-modal-title">
                  {modal.mode === "add" ? "Create Administrator Account" : "Manage Administrator Profile"}
                </h3>
                <p className="account-modal-sub">
                  Secure OTP login credentials will be linked to the registered mobile number
                </p>
              </div>
              <button
                type="button"
                className="account-modal-close"
                onClick={() => setModal(null)}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="account-modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Official Email <span className="text-danger">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    className="form-control"
                    placeholder="e.g. admin@glazia.com"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label fw-semibold">
                  Mobile Number (For WhatsApp/SMS OTP) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light fw-bold text-dark">+91</span>
                  <input
                    required
                    disabled={modal.mode === "edit"}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    value={form.phoneNumber}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phoneNumber: event.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
                {modal.mode === "edit" && (
                  <small className="text-muted mt-1 d-block">
                    Phone number cannot be modified once registered as it is tied to OTP authentication.
                  </small>
                )}
              </div>

              <div>
                <label className="form-label fw-semibold mb-1">
                  Module Permissions & Access Rights
                </label>
                <p className="text-muted small mb-2">
                  Select which dashboard sections this administrator has authority to access:
                </p>

                <div className="account-perm-grid">
                  {permissions
                    .filter((permission) => permission !== "PRODUCTS")
                    .map((permission) => {
                    const isChecked = form.permissions.includes(permission);
                    return (
                      <label
                        key={permission}
                        className={`account-perm-label ${isChecked ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          className="account-perm-checkbox"
                          checked={isChecked}
                          onChange={() => toggle(permission)}
                        />
                        <i
                          className={`fas ${permissionIcons[permission] || "fa-shield-alt"}`}
                          style={{
                            color: isChecked ? "#1e293b" : "#94a3b8",
                            width: "18px",
                            textAlign: "center",
                          }}
                        ></i>
                        <span style={{ fontSize: "13px" }}>
                          {permissionLabels[permission] || permission}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {modal.mode === "edit" && (
                <div className="admin-toggle-wrapper">
                  <div>
                    <div className="fw-semibold text-dark small">Account Status</div>
                    <div className="text-muted small">
                      {form.isActive
                        ? "Account is active and authorized to sign in via OTP"
                        : "Account is disabled and cannot sign in"}
                    </div>
                  </div>
                  <label
                    className="admin-toggle-switch"
                    title={form.isActive ? "Click to deactivate account" : "Click to activate account"}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form.isActive)}
                      onChange={(event) =>
                        setForm({ ...form, isActive: event.target.checked })
                      }
                    />
                    <span className="admin-toggle-slider"></span>
                  </label>
                </div>
              )}
            </div>

            <div className="account-modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setModal(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary-glazia"
              >
                {busy ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    <span>Saving Account...</span>
                  </>
                ) : modal.mode === "add" ? (
                  "Create Administrator"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
