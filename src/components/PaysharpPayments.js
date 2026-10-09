import React, { useState } from 'react';
import api from '../utils/api';
export default function PaysharpPayments({ order, onRefresh }) {
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((value || 0) / 100);
  async function reconcile(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      await api.post('/payments/reconcile', { paysharpReferenceNo: reference }, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setMessage('Payment verified and reconciled.'); await onRefresh();
    } catch (error) { setMessage(error.response?.data?.message || 'Unable to verify payment'); }
    finally { setBusy(false); }
  }
  return <section className="order-details-body">
    <h3>Paysharp payments</h3>
    <p>{order.paymentStatus === 'PAID' ? 'Paid — ready for fulfillment' : order.paymentStatus === 'PARTIALLY_PAID' ? 'Partially paid' : 'Awaiting payment'}</p>
    <p>Total: {money(order.totalPaise)} · Received: {money(order.paidPaise)} · Outstanding: {money(order.totalPaise - order.paidPaise)}</p>
    {order.quotationCode && <p>Quotation: {order.quotationCode}</p>}
    <p>Receipts are verified automatically with Paysharp. Payment confirmation does not mark an order as dispatched.</p>
    <table className="order-main-table"><thead><tr><th>Method</th><th>Amount applied</th><th>UTR</th><th>Reference</th></tr></thead>
      <tbody>{order.payments.map(p => <tr key={p._id}><td>{p.method}</td><td>{money(Math.round(p.amount * 100))}</td><td>{p.utr}</td><td>{p.reference}</td></tr>)}</tbody>
    </table>
    <form onSubmit={reconcile} className="mt-4">
      <label htmlFor="paysharp-reference">Recover a missing bank payment using its Paysharp reference</label>
      <input id="paysharp-reference" className="form-control" value={reference} onChange={e => setReference(e.target.value)} required maxLength={100} />
      <button className="btn btn-primary mt-2" disabled={busy}>{busy ? 'Checking…' : 'Verify with Paysharp'}</button>
      <p role="status">{message}</p>
    </form>
  </section>;
}
