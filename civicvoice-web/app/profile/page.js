'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, token } from '../../lib/api';
import { Badge } from '../../lib/ui';

export default function Profile() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [mine, setMine] = useState([]);
  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    api('/api/auth/me', { auth: true }).then(setMe).catch(() => router.push('/login'));
  }, []);
  useEffect(() => {
    if (!me) return;
    api('/api/complaints').then(d => setMine(d.complaints.filter(c => c.pseudo_citizen_id === me.pseudo_id)));
  }, [me]);
  function logout() { localStorage.clear(); router.push('/'); }
  if (!me) return <p style={{ color: '#94a3b8', padding: 24 }}>Loading...</p>;
  const resolved = mine.filter(c => c.status === 'Resolved').length;
  const card = { background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 14, padding: 20 };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 24 }}>
      <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 14 }}>Citizen ID</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#3b82f6' }}>{me.pseudo_id}</div>
          {me.aadhaar_verified ? <div style={{ color: '#22c55e', fontSize: 14, marginTop: 4 }}>✓ Aadhaar verified</div> : null}
        </div>
        <button onClick={logout} style={{ border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', padding: '10px 18px', borderRadius: 10, cursor: 'pointer' }}>Logout</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, margin: '16px 0' }}>
        {[['Filed', mine.length], ['Resolved', resolved], ['Pending', mine.length - resolved]].map(([k, v]) => (
          <div key={k} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#3b82f6' }}>{v}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid #854d0e', color: '#fde047', fontSize: 14, borderRadius: 12, padding: 12, marginBottom: 16 }}>
        🔒 Your name, phone, and Aadhaar are AES-256 encrypted and never shown publicly. Only your Citizen ID is visible.
      </div>
      <h2 style={{ fontWeight: 600, marginBottom: 8 }}>My Complaints</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {mine.map(c => (
          <Link key={c.id} href={`/complaints/${c.complaint_number}`} style={{ display: 'flex', justifyContent: 'space-between', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 12, textDecoration: 'none', color: '#e2e8f0' }}>
            <span>{c.title}</span><Badge status={c.status} />
          </Link>
        ))}
        {mine.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>No complaints yet.</p>}
      </div>
    </div>
  );
}