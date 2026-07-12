'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(''); const [otpSent, setOtpSent] = useState(false);
  const [reg, setReg] = useState({ name: '', email: '', aadhaar: '' });

  const label = { display: 'block', fontSize: 14, color: '#e2e8f0', margin: '18px 0 8px' };
  const input = { width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '13px 14px', color: '#e2e8f0', fontSize: 15, outline: 'none' };
  const primaryBtn = { width: '100%', background: '#334155', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 20 };
  const tabBtn = (a) => ({ flex: 1, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, background: a ? '#2563eb' : 'transparent', color: a ? '#fff' : '#94a3b8' });
  const linkTxt = { color: '#3b82f6', cursor: 'pointer' };

  function switchTab(t) { setTab(t); setErr(''); setMsg(''); setOtpSent(false); setOtp(''); }
  async function loginSendOtp() { setErr(''); setMsg('');
    try {
      const d = await api('/api/auth/login/send-otp', { method: 'POST', body: { phone } });
      setOtpSent(true);
      setMsg(d.emailed ? `OTP sent to your email ${d.email || ''}. Check inbox/spam.` : `Email not configured — Dev OTP: ${d.devOtp}`);
    } catch (e) { setErr(e.message); }
  }
  async function loginVerify() { setErr('');
    try { const d = await api('/api/auth/login', { method: 'POST', body: { phone, otp } });
      localStorage.setItem('token', d.token); localStorage.setItem('pseudo_id', d.pseudo_id); router.push('/profile'); }
    catch (e) { setErr(e.message); } }
  async function regSendOtp() { setErr(''); setMsg('');
    try {
      const d = await api('/api/auth/send-otp', { method: 'POST', body: { phone, aadhaar: reg.aadhaar, email: reg.email } });
      setOtpSent(true);
      setMsg(d.emailed ? `OTP sent to ${reg.email}. Check inbox/spam.` : `Email not configured — Dev OTP: ${d.devOtp}`);
    } catch (e) { setErr(e.message); }
  }
  async function regComplete() { setErr('');
    try { const d = await api('/api/auth/register', { method: 'POST', body: { ...reg, phone, otp } });
      localStorage.setItem('token', d.token); localStorage.setItem('pseudo_id', d.pseudo_id); router.push('/profile'); }
    catch (e) { setErr(e.message); } }

  const phoneField = (
    <div>
      <label style={label}>Phone Number</label>
      <div style={{ display: 'flex' }}>
        <span style={{ background: '#1e293b', border: '1px solid #334155', borderRight: 'none', borderRadius: '10px 0 0 10px', padding: '13px 14px', color: '#94a3b8' }}>+91</span>
        <input style={{ ...input, borderRadius: '0 10px 10px 0' }} placeholder="10 digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#0f1a2e', border: '1px solid #1e293b', borderRadius: 16, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ background: '#2563eb', color: '#fff', width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>CV</span>
          <span style={{ fontWeight: 700, fontSize: 22 }}>CivicVoice</span>
        </div>

        <div style={{ display: 'flex', gap: 8, background: '#0b1424', border: '1px solid #1e293b', borderRadius: 10, padding: 6 }}>
          <button style={tabBtn(tab === 'login')} onClick={() => switchTab('login')}>Login</button>
          <button style={tabBtn(tab === 'register')} onClick={() => switchTab('register')}>Register</button>
        </div>

        {err && <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #7f1d1d', color: '#fca5a5', fontSize: 14, borderRadius: 8, padding: 10, marginTop: 12 }}>{err}</div>}
        {msg && <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid #166534', color: '#86efac', fontSize: 14, borderRadius: 8, padding: 10, marginTop: 12 }}>{msg}</div>}

        {tab === 'login' ? (
          <div>
            {phoneField}
            {otpSent && <><label style={label}>Enter OTP</label><input style={input} placeholder="6 digit OTP" value={otp} onChange={e => setOtp(e.target.value)} /></>}
            {!otpSent
              ? <button style={primaryBtn} onClick={loginSendOtp}>Login with secure OTP</button>
              : <button style={primaryBtn} onClick={loginVerify}>Verify &amp; Login</button>}
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 20 }}>Don&apos;t have an account? <a onClick={() => switchTab('register')} style={linkTxt}>Register here</a></p>
          </div>
        ) : (
          <div>
            <label style={label}>Full Name</label>
            <input style={input} placeholder="Your full name" value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })} />
            <label style={label}>Email Address</label>
            <input style={input} placeholder="your@email.com" value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} />
            <label style={label}>Aadhaar Number <span style={{ color: '#64748b' }}>(12 digits)</span></label>
            <input style={input} placeholder="12 digit Aadhaar number" value={reg.aadhaar} onChange={e => setReg({ ...reg, aadhaar: e.target.value })} />
            {phoneField}
            {otpSent && <><label style={label}>Enter OTP</label><input style={input} placeholder="6 digit OTP" value={otp} onChange={e => setOtp(e.target.value)} /></>}
            {!otpSent
              ? <button style={primaryBtn} onClick={regSendOtp}>Verify Aadhaar via Phone OTP</button>
              : <button style={primaryBtn} onClick={regComplete}>Complete Registration</button>}
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 20 }}>Already have an account? <a onClick={() => switchTab('login')} style={linkTxt}>Login here</a></p>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 16 }}><Link href="/" style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}>← Back to Homepage</Link></p>
      </div>
    </div>
  );
}