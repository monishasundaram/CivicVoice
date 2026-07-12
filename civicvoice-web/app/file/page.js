'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, token } from '../../lib/api';

const CATS = ['Roads', 'Water', 'Electricity', 'Sanitation', 'Corruption', 'Other'];
const STEPS = [[1, 'Details'], [2, 'Evidence'], [3, 'Submitted']];

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => resolve(window.L);
    document.body.appendChild(s);
  });
}

export default function FileComplaint() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ title: '', category: '', description: '', location: '' });
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [userLoc, setUserLoc] = useState(null);
  const [coords, setCoords] = useState(null);
  const [mapAdjusted, setMapAdjusted] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const mapDivRef = useRef(null); const mapRef = useRef(null);

  useEffect(() => { if (!token()) router.push('/login'); }, []);

  const label = { display: 'block', fontSize: 15, color: '#e2e8f0', fontWeight: 600, marginBottom: 10 };
  const input = { width: '100%', boxSizing: 'border-box', background: '#0b1424', border: '1px solid #334155', borderRadius: 10, padding: '14px 16px', color: '#e2e8f0', fontSize: 15, outline: 'none' };
  const btn = { border: 'none', borderRadius: 10, padding: 15, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#fff' };
  const field = { marginBottom: 24 };
  const words = form.description.trim().split(/\s+/).filter(Boolean).length;

  async function reverseGeocode(lat, lng) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const j = await r.json();
      if (j.display_name) setForm(f => ({ ...f, location: j.display_name }));
    } catch {}
  }
  function setProblem(lat, lng) {
    setForm(f => ({ ...f, location: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    setCoords({ lat, lng });
    setMapAdjusted(true);
    reverseGeocode(lat, lng);
  }
  function getLocation() {
    setErr(''); setGpsStatus('loading');
    if (!navigator.geolocation) { setGpsStatus('error'); return setErr('Geolocation not supported.'); }
    navigator.geolocation.getCurrentPosition(p => {
      const acc = p.coords.accuracy;
      const level = acc <= 50 ? 'High' : acc <= 500 ? 'Medium' : 'Low';
      setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(acc), level });
      setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
      setForm(f => ({ ...f, location: `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}` }));
      reverseGeocode(p.coords.latitude, p.coords.longitude);
      setMapAdjusted(false); setGpsStatus('captured');
    }, () => { setGpsStatus('error'); setErr('Could not get location. Type it manually below.'); }, { enableHighAccuracy: true, timeout: 10000 });
  }

  useEffect(() => {
    if (step !== 1 || gpsStatus !== 'captured' || !userLoc) return;
    let cancelled = false;
    loadLeaflet().then(L => {
      if (cancelled || !mapDivRef.current) return;
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
      const map = L.map(mapDivRef.current).setView([userLoc.lat, userLoc.lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      const icon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] });
      const marker = L.marker([userLoc.lat, userLoc.lng], { draggable: true, icon }).addTo(map);
      marker.on('dragend', () => { const p = marker.getLatLng(); setProblem(p.lat, p.lng); });
      map.on('click', (e) => { marker.setLatLng(e.latlng); setProblem(e.latlng.lat, e.latlng.lng); });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    });
    return () => { cancelled = true; };
  }, [step, gpsStatus, userLoc]);

  function fail(m) { setErr(m); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function next1() {
    setErr('');
    if (!form.title) return fail('Complaint title is required.');
    if (!form.category) return fail('Please select a category.');
    if (!form.location) return fail('Location is required. Use GPS, tap the map, or type it manually.');
    if (words < 10) return fail(`Description needs at least 10 words (have ${words}).`);
    setStep(2);
  }
  async function submit() {
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (coords) { fd.append('lat', coords.lat); fd.append('lng', coords.lng); }
      fd.append('gps_accuracy', mapAdjusted ? 'Medium' : (userLoc?.level || 'Medium'));
      fd.append('evidence', file);
      const d = await api('/api/complaints', { method: 'POST', body: fd, auth: true, form: true });
      setResult(d); setStep(3);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  const circle = (a) => ({ width: 34, height: 34, borderRadius: 999, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, background: a ? '#2563eb' : 'transparent', color: a ? '#fff' : '#64748b', border: a ? 'none' : '2px solid #334155' });

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '16px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0 24px' }}>
        {STEPS.map(([n, lbl], i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={circle(step >= n)}>{step > n ? '✓' : n}</div>
              <span style={{ color: step >= n ? '#3b82f6' : '#64748b', fontWeight: 600 }}>{lbl}</span>
            </div>
            {i < 2 && <div style={{ width: 70, height: 2, background: '#334155', margin: '0 16px' }} />}
          </div>
        ))}
      </div>

      <div style={{ background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 16, padding: 32 }}>
        {err && <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #7f1d1d', color: '#fca5a5', fontSize: 14, borderRadius: 8, padding: 12, marginBottom: 20 }}>{err}</div>}

        {step === 1 && (<>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>File a Complaint</h1>
          <p style={{ color: '#94a3b8', marginTop: 6, marginBottom: 28 }}>Your identity will remain anonymous to the public.</p>

          <div style={field}>
            <label style={label}>Complaint Title</label>
            <input style={input} placeholder="e.g. Broken road near bus stand" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div style={field}>
            <label style={label}>Category</label>
            <select style={input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="" style={{ background: '#0b1424', color: '#94a3b8' }}>Select a category</option>
              {CATS.map(c => <option key={c} style={{ background: '#0b1424', color: '#e2e8f0' }}>{c}</option>)}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Location <span style={{ color: '#ef4444' }}>*</span> <span style={{ color: '#64748b', fontWeight: 400 }}>(Live GPS required)</span></label>

            {gpsStatus !== 'captured' && (
              <button style={{ ...btn, width: '100%', background: '#1e293b', border: '1px solid #334155' }} onClick={getLocation} disabled={gpsStatus === 'loading'}>
                {gpsStatus === 'loading' ? '⏳ Getting your location...' : '📍 Get My Live Location (Required)'}
              </button>
            )}

            {gpsStatus === 'captured' && userLoc?.level === 'Low' && (
              <div style={{ background: 'rgba(127,29,29,0.35)', border: '1px solid #b91c1c', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ color: '#fca5a5', fontWeight: 700 }}>✕ Location accuracy too low — ±{userLoc.acc}m</div>
                <div style={{ color: '#fca5a5', marginTop: 4 }}>Please move to an open area, or tap the map below to set the exact spot.</div>
                <a onClick={getLocation} style={{ color: '#f87171', cursor: 'pointer', textDecoration: 'underline', display: 'inline-block', marginTop: 8 }}>Try again</a>
              </div>
            )}

            {gpsStatus === 'captured' && (
              <div style={{ background: '#0b1424', border: '1px solid #334155', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div><b>🎯 User Location:</b> Captured (±{userLoc.acc}m)</div>
                <div style={{ marginTop: 8 }}><b>🗺️ Problem Location:</b></div>
                <div style={{ color: '#94a3b8', fontSize: 14 }}>Tap the map below to fine-tune the exact problem location.</div>
              </div>
            )}

            {gpsStatus === 'captured' && (
              <div ref={mapDivRef} style={{ height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }} />
            )}

            <input style={input} placeholder="e.g. Anna Nagar, Chennai" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>

          <div style={field}>
            <label style={label}>Description <span style={{ color: '#64748b', fontWeight: 400 }}>(minimum 10 words)</span></label>
            <textarea style={{ ...input, minHeight: 120, resize: 'vertical' }} placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={{ textAlign: 'right', fontSize: 13, color: words >= 10 ? '#22c55e' : '#64748b', marginTop: 6 }}>{words}/10 words</div>
          </div>

          <button style={{ ...btn, width: '100%', background: '#2563eb', fontSize: 16 }} onClick={next1}>Next — Add Evidence</button>
        </>)}

        {step === 2 && (<>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Add Evidence</h1>
          <p style={{ color: '#94a3b8', marginTop: 6, marginBottom: 24 }}>Upload a photo or video (JPG, PNG, WEBP, MP4 — max 10MB). Runs through the AI proof gate.</p>
          <div style={{ border: '2px dashed #334155', borderRadius: 12, padding: 28, textAlign: 'center' }}>
            <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" onChange={e => setFile(e.target.files[0])} style={{ color: '#e2e8f0' }} />
            {file && <div style={{ fontSize: 14, color: '#cbd5e1', marginTop: 12 }}>{file.name} ({Math.round(file.size / 1024)}KB)</div>}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button style={{ ...btn, flex: 1, background: 'transparent', border: '1px solid #334155' }} onClick={() => setStep(1)}>Back</button>
            <button style={{ ...btn, flex: 2, background: '#16a34a', opacity: (busy || !file) ? 0.6 : 1 }} disabled={busy || !file} onClick={submit}>{busy ? 'Running AI gate...' : 'Submit Complaint'}</button>
          </div>
        </>)}

        {step === 3 && result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>✓</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#22c55e' }}>Complaint Submitted</h1>
            <p style={{ marginTop: 10 }}>Complaint Number: <b>{result.complaint_number}</b></p>
            {result.category && <p style={{ marginTop: 8, color: '#93c5fd' }}>AI categorized as: <b>{result.category}</b></p>}
            {result.department && <p style={{ marginTop: 4, color: '#93c5fd' }}>Routed to: <b>{result.department}</b></p>}
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, wordBreak: 'break-all' }}>Blockchain hash: {result.blockchain_hash}</p>
            <a href={`/complaints/${result.complaint_number}`} style={{ ...btn, background: '#2563eb', display: 'inline-block', textDecoration: 'none', marginTop: 20, padding: '12px 24px' }}>View Complaint</a>
          </div>
        )}
      </div>
    </div>
  );
}