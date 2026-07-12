'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';

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

export default function MapPage() {
  const [count, setCount] = useState(0);
  const mapDivRef = useRef(null); const mapRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [L, data] = await Promise.all([loadLeaflet(), api('/api/complaints')]);
      if (cancelled || !mapDivRef.current) return;
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} }
      const pts = (data.complaints || []).filter(c => c.lat && c.lng);
      setCount(pts.length);
      const center = pts.length ? [pts[0].lat, pts[0].lng] : [11.1271, 78.6569];
      const map = L.map(mapDivRef.current).setView(center, pts.length ? 11 : 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      const icon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] });
      pts.forEach(c => {
        L.marker([c.lat, c.lng], { icon }).addTo(map)
          .bindPopup(`<b>${c.title}</b><br>${c.category} • ${c.status}<br><a href="/complaints/${c.complaint_number}">View complaint</a>`);
      });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    })();
    return () => { cancelled = true; };
  }, []);
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Complaint Map</h1>
      <p style={{ color: '#94a3b8', marginTop: 6, marginBottom: 16 }}>{count} complaints with location shown. Click a pin to open it.</p>
      <div ref={mapDivRef} style={{ height: 520, borderRadius: 16, overflow: 'hidden', border: '1px solid #1e293b' }} />
    </div>
  );
}