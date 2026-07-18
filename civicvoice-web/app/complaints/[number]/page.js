'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { api, fileUrl } from '../../../lib/api';
import { Badge } from '../../../lib/ui';

const STEPS = ['Filed', 'Under Review', 'In Progress', 'Resolved'];
const PRIO = { High: '#dc2626', Medium: '#ca8a04', Low: '#16a34a' };

export default function Detail() {
  const { number } = useParams();
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  const [qr, setQr] = useState(''); const [verify, setVerify] = useState(null); const [vBusy, setVBusy] = useState(false);
  useEffect(() => { api('/api/complaints/' + number).then(setD).catch(e => setErr(e.message)); }, [number]);
  useEffect(() => { if (typeof window !== 'undefined') QRCode.toDataURL(window.location.href, { margin: 1, width: 180 }).then(setQr).catch(() => {}); }, [number]);

  async function runVerify() { setVBusy(true); try { setVerify(await api('/api/complaints/' + number + '/verify')); } catch {} setVBusy(false); }

  if (err) return <p style={{ color: '#f87171', padding: 24 }}>{err}</p>;
  if (!d) return <p style={{ color: '#94a3b8', padding: 24 }}>Loading...</p>;
  const c = d.complaint;
  const trust = Math.round((c.ai_score || 0) * 100);
  const trustColor = trust >= 80 ? '#16a34a' : trust >= 60 ? '#ca8a04' : '#dc2626';
  const curIdx = STEPS.indexOf(c.status);
  const tag = (t, bg) => <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, color: '#fff', background: bg }}>{t}</span>;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>{c.title}</h1>
          <p style={{ color: '#94a3b8' }}>{c.category} • {c.location}</p>
          {c.department && <p style={{ color: '#93c5fd', fontSize: 14, marginTop: 4 }}>🏛️ Assigned to: <b>{c.department}</b></p>}
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.complaint_number} • filed by {c.pseudo_citizen_id} • {new Date(c.created_at).toLocaleString()}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge status={c.status} />
          {c.priority && tag('⚡ ' + c.priority, PRIO[c.priority] || '#475569')}
          {tag('🤖 AI Trust ' + trust + '%', trustColor)}
        </div>
      </div>

      {/* Status progress tracker */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 14, padding: '18px 16px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, display: 'grid', placeItems: 'center', fontSize: 13, background: i <= curIdx ? '#2563eb' : 'transparent', color: i <= curIdx ? '#fff' : '#64748b', border: i <= curIdx ? 'none' : '2px solid #334155' }}>{i < curIdx ? '✓' : i + 1}</div>
              <span style={{ fontSize: 11, color: i <= curIdx ? '#3b82f6' : '#64748b', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 18, background: i < curIdx ? '#2563eb' : '#334155' }} />}
          </div>
        ))}
      </div>

      <p style={{ marginTop: 4 }}>{c.description}</p>

      <div style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid #166534', borderRadius: 12, padding: 14, marginTop: 16, fontSize: 14 }}>
        <div>🔒 Tamper-proof. SHA-256 hash:</div>
        <span style={{ color: '#22c55e', wordBreak: 'break-all' }}>{c.blockchain_hash}</span>
        <div style={{ marginTop: 10 }}>
          <button onClick={runVerify} disabled={vBusy} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>{vBusy ? 'Verifying...' : '🔎 Verify Integrity'}</button>
          {verify && (verify.valid
            ? <span style={{ marginLeft: 12, color: '#22c55e', fontWeight: 700 }}>✓ Verified — record is authentic and unchanged.</span>
            : <span style={{ marginLeft: 12, color: '#f87171', fontWeight: 700 }}>✗ Mismatch — record may have been tampered with!</span>)}
        </div>
      </div>

      {qr && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginTop: 16 }}>
          <img src={qr} alt="QR" style={{ width: 120, height: 120, borderRadius: 8, background: '#fff', padding: 6 }} />
          <div><div style={{ fontWeight: 600 }}>Track this complaint</div>
            <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Scan to open this complaint's public tracking page on any phone.</div></div>
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