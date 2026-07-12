'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'model', text: "Hi! I'm the CivicVoice assistant. Ask me how to file a complaint, track one, or about categories and privacy." }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  async function send() {
    const text = input.trim(); if (!text || busy) return;
    const next = [...msgs, { role: 'user', text }];
    setMsgs(next); setInput(''); setBusy(true);
    try {
      const d = await api('/api/chat', { method: 'POST', body: { message: text, history: msgs } });
      setMsgs([...next, { role: 'model', text: d.reply }]);
    } catch { setMsgs([...next, { role: 'model', text: 'Connection error. Is the backend running?' }]); }
    setBusy(false);
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
      {open && (
        <div style={{ width: 340, height: 460, background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#2563eb', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>🤖 CivicVoice Assistant</span>
            <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', color: '#fff', fontSize: 18 }}>×</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: m.role === 'user' ? '#2563eb' : '#1e293b', color: '#e2e8f0', padding: '9px 13px', borderRadius: 12, fontSize: 14, whiteSpace: 'pre-wrap' }}>{m.text}</div>
            ))}
            {busy && <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: 14 }}>typing…</div>}
            <div ref={endRef} />
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #1e293b' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask something..." style={{ flex: 1, background: '#0b1424', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px', color: '#e2e8f0', outline: 'none' }} />
            <button onClick={send} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', cursor: 'pointer', fontWeight: 600 }}>Send</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{ width: 60, height: 60, borderRadius: 999, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 26, boxShadow: '0 8px 24px rgba(37,99,235,0.5)', float: 'right' }}>{open ? '×' : '💬'}</button>
    </div>
  );
}