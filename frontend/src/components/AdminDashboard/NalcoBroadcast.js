import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function NalcoBroadcast() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [allowed, setAllowed] = useState(true);
  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('authToken')}` });
  const refresh = async () => {
    try {
      const response = await api.get('/admin/nalco-broadcast', { headers: headers() });
      setData(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) setAllowed(false);
      else setError('Unable to check broadcast status. Refresh before sending again.');
    }
  };
  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const running = data?.broadcast?.state === 'running';
  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (pullLatest = false) => {
    if ((!pullLatest && !data?.rate) || busy || running) return;
    if (!window.confirm(pullLatest ? "Pull the latest NALCO rate from its website, save it, and send it to all users with valid phone numbers? This sends another message even if they already received an update today." : `Send the latest stored NALCO rate of ₹${(data.rate.nalcoPrice / 1000).toFixed(2)}/kg to all users with valid phone numbers? This sends a new WhatsApp message even if they received today's scheduled update.`)) return;
    setBusy(true);
    setError('');
    try {
      const response = await api.post('/admin/nalco-broadcast', { rateId: data?.rate?._id, pullLatest }, { headers: headers() });
      setData(current => ({ ...current, broadcast: response.data.broadcast }));
    } catch (err) {
      await refresh();
      setError(err.response?.data?.message || 'Request outcome is unknown. Refresh status before trying again.');
    } finally { setBusy(false); }
  };
  if (!allowed) return null;
  const broadcast = data?.broadcast;
  const stale = running && Date.now() - new Date(broadcast.startedAt).getTime() > 15 * 60 * 1000;
  return (
    <section className="analytics-header-card" aria-label="NALCO WhatsApp update" style={{ display: 'block' }}>
      <h3>NALCO WhatsApp update</h3>
      <p>Send the latest database rate to all users with valid phone numbers.</p>
      {data?.rate ? <p><strong>₹{(data.rate.nalcoPrice / 1000).toFixed(2)} / kg</strong> · Rate recorded {new Date(data.rate.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p> : <p>No rate available.</p>}
      <button className="analytics-btn-refresh" onClick={() => send(false)} disabled={!data?.rate || busy || running || !!error}>
        {busy ? 'Starting…' : running ? 'Sending…' : 'Send NALCO update'}
      </button>{' '}
      <button className="analytics-btn-refresh" onClick={() => send(true)} disabled={!data || busy || running || !!error}>Pull latest rate & send</button>{' '}
      <button className="analytics-btn-refresh" onClick={refresh} disabled={busy}>Refresh status</button>
      <div role="status" aria-live="polite" style={{ marginTop: 12 }}>
        {broadcast && <p>Last manual broadcast: {new Date(broadcast.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST{broadcast.nalcoPrice != null && <> · ₹{(broadcast.nalcoPrice / 1000).toFixed(2)}/kg</>}</p>}
        {running && <p>{stale ? 'This broadcast is taking longer than expected or was interrupted. Contact the server administrator before retrying; duplicate sending is blocked.' : broadcast.phase === 'fetching' ? 'Fetching and saving the latest NALCO rate…' : 'Sending in progress. You can leave this page and return to check the result.'}</p>}
        {broadcast?.state === 'completed' && <p>{broadcast.recipients} recipients · {broadcast.accepted} API requests accepted · {broadcast.failed} failed. API acceptance does not confirm delivery to phones.</p>}
        {broadcast?.state === 'failed' && <p>{broadcast.message}</p>}
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
