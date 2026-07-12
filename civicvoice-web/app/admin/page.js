'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { Badge } from '../../lib/ui';

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState({ complaints: [], stats: {} });
  useEffect(() => { api('/api/complaints').then(setData).catch(() => {}); }, []);
  const s = data.stats; const total = s.total || 0;
  const filed = total - (s.under_review || 0) - (s.in_progress || 0) - (s.resolved || 0);
  const rate = total ? Math.round((s.resolved / total) * 100) : 0;
  const byCat = {};
  data.complaints.forEach(c => { byCat[c.category] = (byCat[c.category] || 0) + 1; });
  const maxCat = Math.max(1, ...Object.values(byCat));
  const tabs = ['overview', 'analytics', 'complaints', 'categories', 'system'];
  const card = { background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 14, padding: 22 };

  const catRef = useRef(), statusRef = useRef(), timeRef = useRef(), charts = useRef([]);
  useEffect(() => {
    if (tab !== 'analytics') return;
    let cancelled = false;
    import('chart.js/auto').then(({ default: Chart }) => {
      if (cancelled) return;
      Chart.defaults.color = '#94a3b8';
      charts.current.forEach(c => c.destroy()); charts.current = [];
      const catE = Object.entries(byCat);
      charts.current.push(new Chart(catRef.current, {
        type: 'bar',
        data: { labels: catE.map(e => e[0]), datasets: [{ data: catE.map(e => e[1]), backgroundColor: '#2563eb' }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { precision: 0 }, grid: { color: '#1e293b' } }, x: { grid: { display: false } } } },
      }));
      const STAT = ['Filed', 'Under Review', 'In Progress', 'Resolved'];
      charts.current.push(new Chart(statusRef.current, {
        type: 'doughnut',
        data: { labels: STAT, datasets: [{ data: STAT.map(st => data.complaints.filter(c => c.status === st).length), backgroundColor: ['#475569', '#ca8a04', '#2563eb', '#16a34a'] }] },
        options: { plugins: { legend: { position: 'bottom' } } },
      }));
      const byDate = {};
      data.complaints.forEach(c => { const d = (c.created_at || '').slice(0, 10); if (d) byDate[d] = (byDate[d] || 0) + 1; });
      const dates = Object.keys(byDate).sort();
      charts.current.push(new Chart(timeRef.current, {
        type: 'line',
        data: { labels: dates, datasets: [{ data: dates.map(d => byDate[d]), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.2)', fill: true, tension: 0.3 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { precision: 0 }, grid: { color: '#1e293b' } }, x: { grid: { display: false } } } },
      }));
    });
    return () => { cancelled = true; charts.current.forEach(c => c.destroy()); charts.current = []; };
  }, [tab, data]);

  const statCards = [
    ['Total', total, '#fff', '#1e293b', '#334155'], ['Filed', filed, '#cbd5e1', '#1e293b', '#334155'],
    ['Under Review', s.under_review || 0, '#eab308', '#3a2708', '#78500a'], ['In Progress', s.in_progress || 0, '#3b82f6', '#122142', '#1e3a70'],
    ['Resolved', s.resolved || 0, '#22c55e', '#0c2a17', '#14532d'],
  ];
  const navCards = [['📋', 'All Complaints', 'Public view', '/complaints'], ['👮', 'Officer Dashboard', 'Manage complaints', '/officer'], ['🗺️', 'Complaint Map', 'Location view', '/map']];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 30, fontWeight: 700 }}>Admin Panel</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>System overview and management. Complaint records cannot be altered.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
        {statCards.map(([k, v, color, bg, border]) => (
          <div key={k} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 22, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{v}</div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{k}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid #1e293b', marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', textTransform: 'capitalize', fontSize: 15, fontWeight: 600, padding: '10px 2px', color: tab === t ? '#3b82f6' : '#94a3b8', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent', marginBottom: -1 }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={card}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Resolution Rate</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, height: 12, background: '#334155', borderRadius: 999 }}><div style={{ height: 12, borderRadius: 999, background: '#16a34a', width: rate + '%' }} /></div>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>{rate}%</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 10 }}>{s.resolved || 0} out of {total} complaints resolved</div>
          </div>
          <div style={card}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Quick Navigation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {navCards.map(([icon, t, sub, href]) => (
                <Link key={t} href={href} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 22, textAlign: 'center', textDecoration: 'none', color: '#e2e8f0' }}>
                  <div style={{ fontSize: 30 }}>{icon}</div>
                  <div style={{ fontWeight: 600, marginTop: 8 }}>{t}</div>
                  <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>{sub}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={card}><h3 style={{ fontWeight: 700, marginBottom: 12 }}>Complaints by Category</h3><canvas ref={catRef} height={120} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div style={card}><h3 style={{ fontWeight: 700, marginBottom: 12 }}>By Status</h3><canvas ref={statusRef} height={200} /></div>
            <div style={card}><h3 style={{ fontWeight: 700, marginBottom: 12 }}>Complaints Over Time</h3><canvas ref={timeRef} height={200} /></div>
          </div>
        </div>
      )}

      {tab === 'complaints' && (
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}><th style={{ padding: 8 }}>Number</th><th>Title</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.complaints.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: 8 }}>{c.complaint_number}</td><td>{c.title}</td>
                <td><Badge status={c.status} /></td>
                <td><Link href={`/complaints/${c.complaint_number}`} style={{ color: '#3b82f6' }}>View</Link></td>
              </tr>
            ))}
            {data.complaints.length === 0 && <tr><td colSpan={4} style={{ padding: 16, color: '#64748b' }}>No complaints yet.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'categories' && (
        <div style={{ ...card, display: 'grid', gap: 12 }}>
          {Object.entries(byCat).map(([k, v]) => (
            <div key={k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>{k}</span><span>{v}</span></div>
              <div style={{ height: 12, background: '#334155', borderRadius: 999 }}><div style={{ height: 12, borderRadius: 999, background: '#2563eb', width: (v / maxCat * 100) + '%' }} /></div>
            </div>
          ))}
          {Object.keys(byCat).length === 0 && <p style={{ color: '#64748b' }}>No data.</p>}
        </div>
      )}

      {tab === 'system' && (
        <div style={{ ...card, fontSize: 14, display: 'grid', gap: 8 }}>
          <p><b>Frontend:</b> Next.js (dark UI)</p>
          <p><b>Backend:</b> Node.js + Express</p>
          <p><b>Database:</b> SQLite (citizens, complaints, evidence, actions)</p>
          <p><b>AI:</b> Google Gemini vision (image verification + auto-categorize)</p>
          <p><b>Security:</b> Helmet, CORS, AES-256 encrypted PII, SHA-256 hashing, JWT + email OTP</p>
          <p style={{ color: '#eab308' }}>🔒 All sensitive citizen data is encrypted. Records are tamper-proof.</p>
        </div>
      )}
    </div>
  );
}