'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge } from '../../lib/ui';

export default function Complaints() {
  const [data, setData] = useState({ complaints: [], stats: {} });
  const [q, setQ] = useState(''); const [status, setStatus] = useState('');
  async function load() {
    const p = new URLSearchParams();
    if (q) p.set('q', q); if (status) p.set('status', status);
    setData(await api('/api/complaints?' + p.toString()));
  }
  useEffect(() => { load(); }, [status]);
  const s = data.stats;
  const input = { background: '#0b1424', border: '1px solid #334155', borderRadius: 10, padding: '14px 16px', color: '#e2e8f0', fontSize: 15, outline: 'none' };
  const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 18, textDecoration: 'none', color: '#e2e8f0', display: 'block' };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800 }}>Public Complaints</h1>
      <p style={{ color: '#94a3b8', marginTop: 6, marginBottom: 24 }}>All complaints are publicly visible. Every action is recorded on blockchain.</p>

      <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        <input style={{ ...input, flex: 1, minWidth: 220 }} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search by title or location..." />
        <select style={{ ...input, minWidth: 140 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="" style={{ background: '#0b1424', color: '#e2e8f0' }}>All</option>
{['Filed', 'Under Review', 'In Progress', 'Resolved'].map(x => <option key={x} style={{ background: '#0b1424', color: '#e2e8f0' }}>{x}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[['Total', s.total, '#fff'], ['Under Review', s.under_review, '#eab308'], ['In Progress', s.in_progress, '#3b82f6'], ['Resolved', s.resolved, '#22c55e']].map(([k, v, c]) => (
          <div key={k} style={{ background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: c }}>{v ?? 0}</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>{k}</div>
          </div>
        ))}
      </div>

      {data.complaints.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>No complaints found</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {data.complaints.map(c => (
            <Link key={c.id} href={`/complaints/${c.complaint_number}`} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{c.complaint_number}</span>
                <Badge status={c.status} />
              </div>
              <h3 style={{ fontWeight: 600, marginTop: 4 }}>{c.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>{c.category} • {c.location}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginTop: 8 }}>
                <span>{c.pseudo_citizen_id}</span><span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}