'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { api, fileUrl } from '../../../lib/api';
import { Badge } from '../../../lib/ui';

export default function Detail() {
  const { number } = useParams();
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  const [qr, setQr] = useState('');
  useEffect(() => { api('/api/complaints/' + number).then(setD).catch(e => setErr(e.message)); }, [number]);
  useEffect(() => {
    if (typeof window !== 'undefined') QRCode.toDataURL(window.location.href, { margin: 1, width: 180 }).then(setQr).catch(() => {});
  }, [number]);
  if (err) return <p style={{ color: '#f87171', padding: 24 }}>{err}</p>;
  if (!d) return <p style={{ color: '#94a3b8', padding: 24 }}>Loading...</p>;
  const c = d.complaint;
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>{c.title}</h1>
          <p style={{ color: '#94a3b8' }}>{c.category} • {c.location}</p>
          {c.department && <p style={{ color: '#93c5fd', fontSize: 14, marginTop: 4 }}>🏛️ Assigned to: <b>{c.department}</b></p>}
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.complaint_number} • filed by {c.pseudo_citizen_id} • {new Date(c.created_at).toLocaleString()}</p>
        </div>
        <Badge status={c.status} />
      </div>
      <p style={{ marginTop: 16 }}>{c.description}</p>

      <div style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid #166534', borderRadius: 12, padding: 12, marginTop: 16, fontSize: 14 }}>
        🔒 Tamper-proof. SHA-256 hash:<br /><span style={{ color: '#22c55e', wordBreak: 'break-all' }}>{c.blockchain_hash}</span>
      </div>

      {qr && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginTop: 16 }}>
          <img src={qr} alt="QR" style={{ width: 120, height: 120, borderRadius: 8, background: '#fff', padding: 6 }} />
          <div>
            <div style={{ fontWeight: 600 }}>Track this complaint</div>
            <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Scan this QR code to open this complaint's public tracking page on any phone.</div>
          </div>
        </div>
      )}

      <h2 style={{ fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Evidence</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        {d.evidence.map(e => (
          <div key={e.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 8 }}>
            {e.file_type.startsWith('video')
              ? <video src={fileUrl(e.file_path)} controls style={{ width: '100%', borderRadius: 8 }} />
              : <img src={fileUrl(e.file_path)} alt="evidence" style={{ width: '100%', borderRadius: 8 }} />}
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>GPS {e.gps_verified ? 'verified' : 'unverified'} • {e.ai_authentic ? 'authentic' : 'flagged'}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Action Timeline</h2>
      <div style={{ borderLeft: '2px solid #334155', paddingLeft: 16 }}>
        {d.actions.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>No officer actions yet.</p>}
        {d.actions.map((a, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'absolute', left: -22, top: 4, width: 12, height: 12, borderRadius: 999, background: '#2563eb' }} />
            <div style={{ fontSize: 14 }}>{a.description}</div>
            {a.photo_path && <img src={fileUrl(a.photo_path)} style={{ width: 160, borderRadius: 8, marginTop: 4 }} />}
            <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(a.created_at).toLocaleString()}</div>
            <div style={{ fontSize: 10, color: '#475569', wordBreak: 'break-all' }}>sig: {a.digital_signature}</div>
          </div>
        ))}
      </div>
    </div>
  );
}