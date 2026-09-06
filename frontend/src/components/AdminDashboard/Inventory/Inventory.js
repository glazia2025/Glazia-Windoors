import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import "./Inventory.css";

const emptySummary = { totalSkus: 0, totalUnits: 0, lowStock: 0, outOfStock: 0 };
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("authToken")}` });
const productName = product => product.description || product.perticular || product.part || product.sapCode || product._id;

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
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const [stockResponse, movementResponse] = await Promise.all([
      api.get(`${BASE_API_URL}/admin/inventory`, { headers: auth() }),
      api.get(`${BASE_API_URL}/admin/inventory-movements`, { headers: auth() }),
    ]);
    setInventory(stockResponse.data.inventory || []);
    setSummary(stockResponse.data.summary || emptySummary);
    setMovements(movementResponse.data.movements || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (modal?.mode !== "add" || selected || query.trim().length < 2) { setResults([]); setSearching(false); return undefined; }
    const controller = new AbortController();
    const current = ++requestId.current;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await api.get(`${BASE_API_URL}/user/global-search?search=${encodeURIComponent(query.trim())}`, { headers: auth(), signal: controller.signal });
        if (current === requestId.current) setResults([...(response.data.products || []), ...(response.data.hardware || [])]);
      } catch (error) {
        if (error.name !== "CanceledError") setResults([]);
      } finally {
        if (!controller.signal.aborted && current === requestId.current) setSearching(false);
      }
    }, 400);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [modal, query, selected]);

  const visibleInventory = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return inventory;
    return inventory.filter(item => `${item.productId} ${item.description} ${item.category}`.toLowerCase().includes(term));
  }, [filter, inventory]);

  const closeModal = () => { setModal(null); setForm({ quantity: 0, reorderLevel: 0, reason: "" }); setQuery(""); setSelected(null); setResults([]); };
  const openAdd = () => { setForm({ quantity: 0, reorderLevel: 0, reason: "Initial stock entry" }); setModal({ mode: "add" }); };
  const openEdit = item => { setForm({ quantity: item.quantity, reorderLevel: item.reorderLevel, reason: "" }); setModal({ mode: "edit", item }); };
  const openDelete = item => { setForm({ quantity: item.quantity, reorderLevel: item.reorderLevel, reason: "" }); setModal({ mode: "delete", item }); };

  const save = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (modal.mode === "add") {
        if (!selected) return;
        const code = selected.sapCode || selected._id;
        await api.post(`${BASE_API_URL}/admin/inventory`, {
          productId: code, description: productName(selected),
          category: selected.perticular || selected.subCategory ? "HARDWARE" : "PROFILE",
          quantity: Number(form.quantity), reorderLevel: Number(form.reorderLevel), reason: form.reason,
        }, { headers: auth() });
      } else if (modal.mode === "edit") {
        await api.patch(`${BASE_API_URL}/admin/inventory/${modal.item._id}`, {
          quantity: Number(form.quantity), reorderLevel: Number(form.reorderLevel), reason: form.reason,
        }, { headers: auth() });
      } else {
        await api.delete(`${BASE_API_URL}/admin/inventory/${modal.item._id}`, { headers: auth(), data: { reason: form.reason } });
      }
      closeModal();
      await load();
    } finally { setSaving(false); }
  };

  return <main className="glazia-inventory container py-4">
    <header className="inventory-heading">
      <div><span className="inventory-kicker">GLAZIA OPERATIONS</span><h2>Main inventory</h2><p>Track central stock, reorder thresholds and every manual movement.</p></div>
      <button className="inventory-primary" onClick={openAdd}><i className="fas fa-plus" />Add inventory item</button>
    </header>

    <section className="inventory-stats">
      <article><i className="fas fa-boxes"/><div><span>Total SKUs</span><strong>{summary.totalSkus}</strong></div></article>
      <article><i className="fas fa-layer-group"/><div><span>Total units</span><strong>{summary.totalUnits}</strong></div></article>
      <article className="warning"><i className="fas fa-exclamation-triangle"/><div><span>Low stock</span><strong>{summary.lowStock}</strong></div></article>
      <article className="danger"><i className="fas fa-times-circle"/><div><span>Out of stock</span><strong>{summary.outOfStock}</strong></div></article>
    </section>

    <section className="inventory-panel">
      <div className="inventory-toolbar">
        <div className="inventory-tabs"><button className={tab === "stock" ? "active" : ""} onClick={() => setTab("stock")}>Current stock</button><button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>Movement history</button></div>
        {tab === "stock" && <label className="inventory-search"><i className="fas fa-search"/><input value={filter} onChange={event => setFilter(event.target.value)} placeholder="Search product or SAP code"/></label>}
      </div>
      {tab === "stock" ? (visibleInventory.length ? <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>Product</th><th>Category</th><th>Available</th><th>Reorder at</th><th>Status</th><th aria-label="Actions"/></tr></thead><tbody>{visibleInventory.map(item => {
        const out = item.quantity === 0; const low = item.quantity <= item.reorderLevel;
        return <tr key={item._id}><td><b>{item.description}</b><small>{item.productId}</small></td><td>{item.category}</td><td className="stock-number">{item.quantity}</td><td>{item.reorderLevel}</td><td><span className={`stock-status ${out ? "out" : low ? "low" : "healthy"}`}>{out ? "Out of stock" : low ? "Low stock" : "In stock"}</span></td><td><div className="inventory-actions"><button onClick={() => openEdit(item)} title="Edit item"><i className="fas fa-pen"/></button><button className="delete" onClick={() => openDelete(item)} title="Delete item"><i className="fas fa-trash-alt"/></button></div></td></tr>;
      })}</tbody></table></div> : <div className="inventory-empty"><i className="fas fa-box-open"/><h4>No inventory items found</h4><p>Add a product from the Glazia catalogue to start tracking stock.</p></div>) :
      (movements.length ? <div className="inventory-table-wrap"><table className="inventory-table history"><thead><tr><th>Date</th><th>Product</th><th>Action</th><th>Change</th><th>Balance</th><th>Reason / Admin</th></tr></thead><tbody>{movements.map(movement => <tr key={movement._id}><td>{new Date(movement.createdAt).toLocaleString("en-IN")}</td><td><b>{movement.description}</b><small>{movement.productId}</small></td><td><span className="movement-action">{movement.action.replaceAll("_", " ")}</span></td><td className={movement.quantityChange >= 0 ? "positive" : "negative"}>{movement.quantityChange > 0 ? "+" : ""}{movement.quantityChange}</td><td>{movement.balanceAfter}</td><td>{movement.reason || "—"}<small>{movement.performedBy}</small></td></tr>)}</tbody></table></div> : <div className="inventory-empty"><i className="fas fa-history"/><h4>No movements yet</h4></div>)}
    </section>

    {modal && <div className="inventory-modal-backdrop" role="presentation"><form className="inventory-modal" onSubmit={save} role="dialog" aria-modal="true">
      <header><div><h3>{modal.mode === "add" ? "Add inventory item" : modal.mode === "edit" ? "Edit inventory item" : "Delete inventory item"}</h3><p>{modal.mode === "add" ? "Choose a product from the Glazia catalogue." : `${modal.item.description} · ${modal.item.productId}`}</p></div><button type="button" className="inventory-icon-button" onClick={closeModal} aria-label="Close"><i className="fas fa-times"/></button></header>
      <div className="inventory-modal-body">
        {modal.mode === "delete" ? <div className="delete-warning"><i className="fas fa-exclamation-triangle"/><p>This permanently removes the item and its <b>{modal.item.quantity} units</b> from current stock. The deletion remains in movement history.</p></div> : <>
          {modal.mode === "add" && <div className="form-field"><label>Catalogue product</label><div className="catalogue-search"><i className="fas fa-search"/><input autoFocus value={query} onChange={event => { setQuery(event.target.value); setSelected(null); }} placeholder="Search by name or SAP code"/>{searching && <i className="fas fa-circle-notch fa-spin search-spinner"/>}</div>{results.length > 0 && !selected && <div className="catalogue-results">{results.map(product => { const code = product.sapCode || product._id; const exists = inventory.some(item => item.productId === code); return <button type="button" disabled={exists} key={`${product._id}-${code}`} onClick={() => { setSelected(product); setQuery(`${productName(product)} (${code})`); setResults([]); }}><span><b>{productName(product)}</b><small>{code}{product.subCategory ? ` · ${product.subCategory}` : ""}</small></span>{exists && <em>Already added</em>}</button>; })}</div>}{query.trim().length === 1 && <small className="field-hint">Enter at least 2 characters.</small>}</div>}
          <div className="form-grid"><div className="form-field"><label>Available quantity</label><input required type="number" min="0" step="1" value={form.quantity} onChange={event => setForm({ ...form, quantity: event.target.value })}/></div><div className="form-field"><label>Low-stock threshold</label><input required type="number" min="0" step="1" value={form.reorderLevel} onChange={event => setForm({ ...form, reorderLevel: event.target.value })}/></div></div>
        </>}
        <div className="form-field"><label>{modal.mode === "delete" ? "Reason for deletion" : "Reason / note"}</label><textarea required={modal.mode !== "add"} rows="3" value={form.reason} onChange={event => setForm({ ...form, reason: event.target.value })} placeholder="Add context for this stock change"/></div>
      </div>
      <footer><button type="button" className="inventory-secondary" onClick={closeModal}>Cancel</button><button disabled={saving || (modal.mode === "add" && !selected)} className={modal.mode === "delete" ? "inventory-danger" : "inventory-primary"}>{saving ? "Saving…" : modal.mode === "delete" ? "Delete item" : "Save inventory"}</button></footer>
    </form></div>}
  </main>;
}
