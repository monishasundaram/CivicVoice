'use client';
import { useEffect, useState } from 'react';
import { api, officerToken, fileUrl } from '../../lib/api';
import { Badge } from '../../lib/ui';

const STATUSES = ['Filed', 'Under Review', 'In Progress', 'Resolved'];
const DEMO = [
  ['OFF-PWD-01', 'Public Works'], ['OFF-WTR-01', 'Water Board'],
  ['OFF-ELE-01', 'Electricity'], ['OFF-SAN-01', 'Sanitation'],
];

export default function Officer() {
  const [authed, setAuthed] = useState(false);
  const [cred, setCred] = useState({ officerId: '', password: '' });
  const [me, setMe] = useState({ name: '', officer_id: '', department: '' });
  const [err, setErr] = useState('');
  const [list, setList] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [sel, setSel] = useState(null);
  const [detail, setDetail] = useState(null);
  const [actionText, setActionText] = useState('');
  const [actionPhoto, setActionPhoto] = useState(null);

  useEffect(() => {
    if (officerToken()) {
      setAuthed(true);
      setMe({ name: localStorage.getItem('officerName') || '', officer_id: localStorage.getItem('officerId') || '', department: localStorage.getItem('officerDept') || '' });
    }
  }, []);
  useEffect(() => { if (authed) loadList(); }, [authed, showAll]);

  async function login(e) {
    e.preventDefault(); setErr('');
    try {
      const d = await api('/api/auth/officer/login', { method: 'POST', body: cred });
      localStorage.setItem('officerToken', d.token);
      localStorage.setItem('officerName', d.name);
      localStorage.setItem('officerId', d.officer_id || '');
      localStorage.setItem('officerDept', d.department || '');
      setMe({ name: d.name, officer_id: d.officer_id, department: d.department });
      setAuthed(true);
    } catch (e) { setErr(e.message); }
  }
  function logout() { localStorage.removeItem('officerToken'); setAuthed(false); setDetail(null); setSel(null); }
  async function loadList() { const d = await api('/api/officer/complaints' + (showAll ? '?all=1' : ''), { auth: true, officer: true }); setList(d.complaints); }
  async function open(c) { setSel(c); setDetail(await api('/api/complaints/' + c.complaint_number)); }
  async function setStatus(status) { await api(`/api/officer/complaints/${sel.id}/status`, { method: 'POST', body: { status }, auth: true, officer: true }); await loadList(); await open(sel); }
  async function logAction() {
    if (!actionText) return;
    const fd = new FormData(); fd.append('description', actionText); if (actionPhoto) fd.append('photo', actionPhoto);
    await api(`/api/officer/complaints/${sel.id}/action`, { method: 'POST', body: fd, auth: true, officer: true, form: true });
    setActionText(''); setActionPhoto(null); await open(sel);
  }

  const input = { width: '100%', boxSizing: 'border-box', background: '#0b1424', border: '1px solid #334155', borderRadius: 10, padding: '13px 14px', color: '#e2e8f0', fontSize: 15, outline: 'none' };
  const pill = { fontSize: 12, background: '#334155', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 8, cursor: 'pointer' };

  if (!authed) return (
    <form onSubmit={login} style={{ maxWidth: 420, margin: '48px auto', background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 16, padding: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 26 }}>👮</span>
        <h1 style={{ fontWeight: 700, fontSize: 22 }}>Officer Portal</h1>
      </div>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 18 }}>Sign in with your government-issued Officer ID.</p>
      {err && <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #7f1d1d', color: '#fca5a5', fontSize: 14, borderRadius: 8, padding: 10, marginBottom: 14 }}>{err}</div>}
      <label style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>Officer ID</label>
      <input style={{ ...input, margin: '8px 0 14px', letterSpacing: 1 }} placeholder="OFF-PWD-01" value={cred.officerId} onChange={e => setCred({ ...cred, officerId: e.target.value })} />
      <label style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>Password</label>
      <input style={{ ...input, marginTop: 8 }} type="password" placeholder="Password" value={cred.password} onChange={e => setCred({ ...cred, password: e.target.value })} />
      <button style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontWeight: 700, cursor: 'pointer', marginTop: 18 }}>Sign In</button>
      <div style={{ marginTop: 16, borderTop: '1px solid #1e293b', paddingTop: 12 }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Demo officer IDs (password: officer123)</div>
        {DEMO.map(([id, dept]) => (
          <div key={id} onClick={() => setCred({ officerId: id, password: 'officer123' })} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#93c5fd', cursor: 'pointer', padding: '3px 0' }}>
            <span>{id}</span><span style={{ color: '#64748b' }}>{dept}</span>
          </div>
        ))}
      </div>
    </form>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#2563eb', display: 'grid', placeItems: 'center', fontSize: 22 }}>👮</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{me.name}</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{me.officer_id} • {me.department}</div>
          </div>
        </div>
        <button onClick={logout} style={{ border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', padding: '9px 16px', borderRadius: 10, cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontWeight: 600 }}>Complaints ({list.length})</h2>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 5, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} /> All depts
            </label>
          </div>
          {list.map(c => (
            <button key={c.id} onClick={() => open(c)} style={{ width: '100%', textAlign: 'left', background: '#1e293b', border: `1px solid ${sel?.id === c.id ? '#2563eb' : '#334155'}`, borderRadius: 10, padding: 12, marginBottom: 8, cursor: 'pointer', color: '#e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 14 }}>{c.title}</span><Badge status={c.status} /></div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{c.complaint_number} • {c.category}</div>
            </button>
          ))}
          {list.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>No complaints for your department yet.</p>}
        </div>
        <div>
          {!detail ? <p style={{ color: '#64748b' }}>Select a complaint.</p> : (
            <div style={{ background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 16, padding: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{detail.complaint.title}</h2>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>{detail.complaint.category} • {detail.complaint.location}</p>
              <p style={{ marginTop: 8 }}>{detail.complaint.description}</p>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 14, marginBottom: 6 }}>Update status:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => <button key={s} style={pill} onClick={() => setStatus(s)}>{s}</button>)}
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 14, marginBottom: 6 }}>Log an action:</div>
                <textarea style={{ ...input, minHeight: 70 }} value={actionText} onChange={e => setActionText(e.target.value)} placeholder="Describe the action taken..." />
                <input type="file" onChange={e => setActionPhoto(e.target.files[0])} style={{ marginTop: 8, color: '#e2e8f0' }} />
                <button style={{ display: 'block', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', marginTop: 8, fontWeight: 600 }} onClick={logAction}>Sign &amp; Save Action</button>
              </div>
              <h3 style={{ fontWeight: 600, marginTop: 20, marginBottom: 8 }}>Timeline</h3>
              <div style={{ borderLeft: '2px solid #334155', paddingLeft: 16 }}>
                {detail.actions.map((a, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 12 }}>
                    <div style={{ position: 'absolute', left: -22, top: 4, width: 12, height: 12, borderRadius: 999, background: '#2563eb' }} />
                    <div style={{ fontSize: 14 }}>{a.description}</div>
                    {a.photo_path && <img src={fileUrl(a.photo_path)} style={{ width: 128, borderRadius: 6, marginTop: 4 }} />}
                    <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}