'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useLang } from '../lib/i18n';

function Icon({ name }) {
  const p = {
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    ai: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    clip: <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />,
    check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{p[name]}</svg>;
}

export default function Home() {
  const { t } = useLang();
  const [s, setS] = useState({ total: 0, resolved: 0 });
  useEffect(() => { api('/api/complaints').then(d => setS(d.stats || {})).catch(() => {}); }, []);
  const pending = (s.total || 0) - (s.resolved || 0);

  const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24 };
  const iconBox = (bg, color) => ({ width: 48, height: 48, borderRadius: 12, background: bg, color, display: 'grid', placeItems: 'center' });
  const btn = { padding: '13px 26px', borderRadius: 11, fontWeight: 600, textDecoration: 'none', display: 'inline-block' };

  const stats = [[t('statTotal'), s.total || 0, '#3b82f6'], [t('statResolved'), s.resolved || 0, '#22c55e'], [t('statPending'), pending, '#eab308']];
  const steps = [
    ['1', t('s1t'), t('s1d')],
    ['2', t('s2t'), t('s2d')],
    ['3', t('s3t'), t('s3d')],
  ];
  const features = [
    ['lock', 'rgba(234,179,8,0.15)', '#eab308', t('f1t'), t('f1d')],
    ['ai', 'rgba(37,99,235,0.15)', '#3b82f6', t('f2t'), t('f2d')],
    ['user', 'rgba(168,85,247,0.15)', '#a855f7', t('f3t'), t('f3d')],
    ['clip', 'rgba(249,115,22,0.15)', '#f97316', t('f4t'), t('f4d')],
    ['check', 'rgba(34,197,94,0.15)', '#22c55e', t('f5t'), t('f5d')],
    ['eye', 'rgba(244,63,94,0.15)', '#f43f5e', t('f6t'), t('f6d')],
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
      <section style={{ textAlign: 'center', padding: '64px 0 32px' }}>
        <span style={{ display: 'inline-block', fontSize: 13, color: '#93c5fd', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.35)', borderRadius: 999, padding: '7px 18px' }}>{t('heroBadge')}</span>
        <h1 style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.05, margin: '26px 0 0', letterSpacing: '-0.03em' }}>
          {t('heroTitle1')}<br /><span style={{ color: '#3b82f6' }}>{t('heroTitle2')}</span>
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: 560, margin: '22px auto 0', fontSize: 16, lineHeight: 1.7 }}>{t('heroSubtitle')}</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <Link href="/file" style={{ ...btn, background: '#2563eb', color: '#fff' }}>{t('fileBtn')}</Link>
          <Link href="/complaints" style={{ ...btn, border: '1px solid #334155', color: '#e2e8f0' }}>{t('viewBtn')}</Link>
          <Link href="/login" style={{ ...btn, border: '1px solid #2563eb', color: '#60a5fa' }}>{t('loginBtn')}</Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, maxWidth: 640, margin: '16px auto 48px' }}>
        {stats.map(([k, v, c]) => (
          <div key={k} className="lift" style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{k}</div>
          </div>
        ))}
      </section>

      <section style={{ padding: '8px 0 40px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{t('howTitle')}</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 32 }}>{t('howSub')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {steps.map(([n, title, desc]) => (
            <div key={n} className="lift" style={{ ...card, textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: '#2563eb', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, margin: '0 auto' }}>{n}</div>
              <h3 style={{ fontWeight: 700, fontSize: 17, margin: '14px 0 0' }}>{title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '8px 0 56px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 32, letterSpacing: '-0.02em' }}>{t('whyTitle')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {features.map(([name, bg, color, title, desc]) => (
            <div key={name} className="lift" style={card}>
              <div style={iconBox(bg, color)}><Icon name={name} /></div>
              <h3 style={{ fontWeight: 700, fontSize: 16, margin: '16px 0 0' }}>{title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #1e293b', padding: 20, textAlign: 'center', color: '#64748b', fontSize: 13 }}>{t('footer')}</footer>
    </div>
  );
}