import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import "./Inventory.css";

const emptySummary = { totalSkus: 0, totalUnits: 0, lowStock: 0, outOfStock: 0 };
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("authToken")}` });
const productName = (product) =>
  product.description || product.perticular || product.part || product.sapCode || product._id;

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [movements, setMovements] = useState([]);
  const [tab, setTab] = useState("stock");
  const [filter, setFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ quantity: 0, reorderLevel: 0, reason: "" });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stockResponse, movementResponse] = await Promise.all([
        api.get(`${BASE_API_URL}/admin/inventory`, { headers: auth() }),
        api.get(`${BASE_API_URL}/admin/inventory-movements`, { headers: auth() }),
      ]);
      setInventory(stockResponse.data.inventory || []);
      setSummary(stockResponse.data.summary || emptySummary);
      setMovements(movementResponse.data.movements || []);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (modal?.mode !== "add" || selected || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    const controller = new AbortController();
    const current = ++requestId.current;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await api.get(
          `${BASE_API_URL}/user/global-search?search=${encodeURIComponent(query.trim())}`,
          { headers: auth(), signal: controller.signal }
        );
        if (current === requestId.current) {
          setResults([
            ...(response.data.products || []),
            ...(response.data.hardware || []),
          ]);
        }
      } catch (error) {
        if (error.name !== "CanceledError") setResults([]);
      } finally {
        if (!controller.signal.aborted && current === requestId.current) {
          setSearching(false);
        }
      }
    }, 400);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [modal, query, selected]);

  const visibleInventory = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return inventory;
    return inventory.filter((item) =>
      `${item.productId} ${item.description} ${item.category}`
        .toLowerCase()
        .includes(term)
    );
  }, [filter, inventory]);

  const closeModal = () => {
    setModal(null);
    setForm({ quantity: 0, reorderLevel: 0, reason: "" });
    setQuery("");
    setSelected(null);
    setResults([]);
  };

  const openAdd = () => {
    setForm({ quantity: 0, reorderLevel: 0, reason: "Initial stock entry" });
    setModal({ mode: "add" });
  };

  const openEdit = (item) => {
    setForm({
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      reason: "",
    });
    setModal({ mode: "edit", item });
  };

  const openDelete = (item) => {
    setForm({
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      reason: "",
    });
    setModal({ mode: "delete", item });
  };

  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (modal.mode === "add") {
        if (!selected) return;
        const code = selected.sapCode || selected._id;
        await api.post(
          `${BASE_API_URL}/admin/inventory`,
          {
            productId: code,
            description: productName(selected),
            category:
              selected.perticular || selected.subCategory
                ? "HARDWARE"
                : "PROFILE",
            quantity: Number(form.quantity),
            reorderLevel: Number(form.reorderLevel),
            reason: form.reason,
          },
          { headers: auth() }
        );
      } else if (modal.mode === "edit") {
        await api.patch(
          `${BASE_API_URL}/admin/inventory/${modal.item._id}`,
          {
            quantity: Number(form.quantity),
            reorderLevel: Number(form.reorderLevel),
            reason: form.reason,
          },
          { headers: auth() }
        );
      } else {
        await api.delete(`${BASE_API_URL}/admin/inventory/${modal.item._id}`, {
          headers: auth(),
          data: { reason: form.reason },
        });
      }
      closeModal();
      await load();
    } catch (err) {
      console.error("Failed to save inventory item:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inventory-container">
      {/* Top Header Card */}
      <div className="inventory-card">
        <div className="inventory-card-header">
          <div className="inventory-header-left">
            <div className="inventory-header-icon">
              <i className="fas fa-boxes"></i>
            </div>
            <div>
              <h4 className="inventory-card-title">Main Warehouse Inventory</h4>
              <p className="inventory-card-subtitle">
                Monitor central stock levels, safety thresholds, and complete audit movement history
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inventory-btn-add"
            onClick={openAdd}
          >
            <i className="fas fa-plus"></i>
            <span>Add Inventory Item</span>
          </button>
        </div>

        {/* 4 Stat Metrics */}
        <div className="inventory-stats-section">
          <div className="inventory-stats-grid">
            <div className="inventory-stat-card">
              <div className="inventory-stat-icon skus">
                <i className="fas fa-barcode"></i>
              </div>
              <div>
                <div className="inventory-stat-label">Total SKUs Tracked</div>
                <div className="inventory-stat-val">{summary.totalSkus}</div>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-icon units">
                <i className="fas fa-layer-group"></i>
              </div>
              <div>
                <div className="inventory-stat-label">Total Units in Stock</div>
                <div className="inventory-stat-val">{summary.totalUnits}</div>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-icon warning">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div>
                <div className="inventory-stat-label">Low Stock Alerts</div>
                <div className="inventory-stat-val" style={{ color: "#d97706" }}>
                  {summary.lowStock}
                </div>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-icon danger">
                <i className="fas fa-times-circle"></i>
              </div>
              <div>
                <div className="inventory-stat-label">Out of Stock SKUs</div>
                <div className="inventory-stat-val" style={{ color: "#dc2626" }}>
                  {summary.outOfStock}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar with Tabs and Search */}
        <div className="inventory-toolbar">
          <div className="inventory-tabs">
            <button
              type="button"
              className={`inventory-tab-btn ${tab === "stock" ? "active" : ""}`}
              onClick={() => setTab("stock")}
            >
              <i className="fas fa-list-ul"></i>
              <span>Current Stock ({inventory.length})</span>
            </button>
            <button
              type="button"
              className={`inventory-tab-btn ${tab === "history" ? "active" : ""}`}
              onClick={() => setTab("history")}
            >
              <i className="fas fa-history"></i>
              <span>Movement History ({movements.length})</span>
            </button>
          </div>

          {tab === "stock" && (
            <div className="inventory-search-wrap">
              <i className="fas fa-search inventory-search-icon"></i>
              <input
                type="text"
                className="inventory-search-input"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Search by product name, category or SAP code..."
              />
            </div>
          )}
        </div>

        {/* Table View */}
        <div className="inventory-table-wrapper">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="small text-muted mt-2">Loading warehouse inventory...</div>
            </div>
          ) : tab === "stock" ? (
            visibleInventory.length === 0 ? (
              <div className="inventory-empty-wrap">
                <div className="inventory-empty-icon">
                  <i className="fas fa-box-open"></i>
                </div>
                <h5 className="mb-1 text-dark" style={{ fontSize: "16px", fontWeight: 700 }}>
                  No inventory items found
                </h5>
                <p className="small text-muted mb-0">
                  Add a product from the Glazia catalogue to start tracking stock.
                </p>
              </div>
            ) : (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Product Details</th>
                    <th style={{ width: "15%" }}>Category</th>
                    <th style={{ width: "15%" }}>Available Qty</th>
                    <th style={{ width: "15%" }}>Reorder Level</th>
                    <th style={{ width: "12%" }}>Status</th>
                    <th style={{ width: "8%", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInventory.map((item) => {
                    const out = item.quantity === 0;
                    const low = item.quantity <= item.reorderLevel;
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="inventory-product-cell">
                            <b>{item.description}</b>
                            <small>{item.productId}</small>
                          </div>
                        </td>
                        <td>
                          <span className="inventory-category-badge">{item.category}</span>
                        </td>
                        <td>
                          <span className="inventory-qty-num">{item.quantity}</span>
                        </td>
                        <td>
                          <span className="text-muted fw-semibold">{item.reorderLevel} units</span>
                        </td>
                        <td>
                          <span
                            className={`inventory-status-pill ${
                              out ? "out" : low ? "low" : "healthy"
                            }`}
                          >
                            <i
                              className={`fas ${
                                out
                                  ? "fa-times-circle"
                                  : low
                                  ? "fa-exclamation-triangle"
                                  : "fa-check-circle"
                              }`}
                            ></i>
                            {out ? "Out of Stock" : low ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                        <td>
                          <div className="inventory-row-actions">
                            <button
                              type="button"
                              className="inventory-btn-action"
                              onClick={() => openEdit(item)}
                              title="Edit Item"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              className="inventory-btn-action delete"
                              onClick={() => openDelete(item)}
                              title="Delete Item"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : movements.length === 0 ? (
            <div className="inventory-empty-wrap">
              <div className="inventory-empty-icon">
                <i className="fas fa-history"></i>
              </div>
              <h5 className="mb-1 text-dark" style={{ fontSize: "16px", fontWeight: 700 }}>
                No movement history recorded yet
              </h5>
              <p className="small text-muted mb-0">
                Stock additions, deductions, and edits will appear here.
              </p>
            </div>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th style={{ width: "18%" }}>Date & Time</th>
                  <th style={{ width: "30%" }}>Product</th>
                  <th style={{ width: "16%" }}>Action Type</th>
                  <th style={{ width: "12%" }}>Quantity Change</th>
                  <th style={{ width: "12%" }}>Balance After</th>
                  <th style={{ width: "12%" }}>Reason / Admin</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement._id}>
                    <td>
                      <div className="text-muted small">
                        {new Date(movement.createdAt).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="inventory-product-cell">
                        <b>{movement.description}</b>
                        <small>{movement.productId}</small>
                      </div>
                    </td>
                    <td>
                      <span className="movement-badge">
                        {movement.action.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          movement.quantityChange >= 0
                            ? "movement-change-positive"
                            : "movement-change-negative"
                        }
                      >
                        {movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange}
                      </span>
                    </td>
                    <td>
                      <b>{movement.balanceAfter}</b>
                    </td>
                    <td>
                      <div className="small text-dark fw-medium">
                        {movement.reason || "—"}
                      </div>
                      <small className="text-muted">{movement.performedBy}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit / Delete Modal */}
      {modal && (
        <div className="inv-modal-backdrop" role="presentation">
          <form className="inv-modal" onSubmit={save} role="dialog" aria-modal="true">
            <div className="inv-modal-header">
              <div>
                <h3 className="inv-modal-title">
                  {modal.mode === "add"
                    ? "Add Catalogue Item to Inventory"
                    : modal.mode === "edit"
                    ? "Edit Inventory Item"
                    : "Delete Inventory Item"}
                </h3>
                <p className="inv-modal-sub">
                  {modal.mode === "add"
                    ? "Search and select a product from the official Glazia catalogue"
                    : `${modal.item.description} · ${modal.item.productId}`}
                </p>
              </div>
              <button
                type="button"
                className="inv-modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="inv-modal-body">
              {modal.mode === "delete" ? (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-0" role="alert">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div>
                    This permanently removes this item and its <b>{modal.item.quantity} units</b> from current active stock. The action will be logged in the audit movement history.
                  </div>
                </div>
              ) : (
                <>
                  {modal.mode === "add" && (
                    <div className="inv-search-dropdown">
                      <label className="form-label fw-semibold">
                        Catalogue Product <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control"
                          autoFocus
                          value={query}
                          onChange={(event) => {
                            setQuery(event.target.value);
                            setSelected(null);
                          }}
                          placeholder="Search product by name or SAP code..."
                        />
                        {searching && (
                          <div
                            className="position-absolute"
                            style={{ right: "12px", top: "50%", transform: "translateY(-50%)" }}
                          >
                            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                          </div>
                        )}
                      </div>

                      {results.length > 0 && !selected && (
                        <div className="inv-dropdown-results">
                          {results.map((product) => {
                            const code = product.sapCode || product._id;
                            const exists = inventory.some((item) => item.productId === code);
                            return (
                              <button
                                type="button"
                                disabled={exists}
                                key={`${product._id}-${code}`}
                                className="inv-dropdown-item"
                                onClick={() => {
                                  setSelected(product);
                                  setQuery(`${productName(product)} (${code})`);
                                  setResults([]);
                                }}
                              >
                                <div>
                                  <div className="fw-semibold text-dark small">{productName(product)}</div>
                                  <small className="text-muted">
                                    {code}
                                    {product.subCategory ? ` · ${product.subCategory}` : ""}
                                  </small>
                                </div>
                                {exists && <span className="badge bg-secondary">Already in Inventory</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Available Stock Quantity <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="1"
                        className="form-control"
                        value={form.quantity}
                        onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Low Stock Alert Threshold <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="1"
                        className="form-control"
                        value={form.reorderLevel}
                        onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="form-label fw-semibold">
                  {modal.mode === "delete" ? "Reason for Deletion *" : "Audit Note / Reason"}
                </label>
                <textarea
                  required={modal.mode !== "add"}
                  rows="3"
                  className="form-control"
                  value={form.reason}
                  onChange={(event) => setForm({ ...form, reason: event.target.value })}
                  placeholder="Enter context or justification for this stock adjustment..."
                />
              </div>
            </div>

            <div className="inv-modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || (modal.mode === "add" && !selected)}
                className={`btn ${modal.mode === "delete" ? "btn-danger" : "btn-primary-glazia"}`}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    <span>Saving...</span>
                  </>
                ) : modal.mode === "delete" ? (
                  "Delete Item"
                ) : (
                  "Save Item"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
