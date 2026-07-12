'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useLang } from '../lib/i18n';

export default function Home() {
  const { t } = useLang();
  const [s, setS] = useState({ total: 0, resolved: 0 });
  useEffect(() => { api('/api/complaints').then(d => setS(d.stats || {})).catch(() => {}); }, []);
  const pending = (s.total || 0) - (s.resolved || 0);

  const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24 };
  const iconBox = (bg, color) => ({ width: 46, height: 46, borderRadius: 12, background: bg, color, display: 'grid', placeItems: 'center', fontSize: 26 });
  const btn = { padding: '13px 26px', borderRadius: 11, fontWeight: 500, textDecoration: 'none', display: 'inline-block' };

  const stats = [[t('statTotal'), s.total || 0, '#3b82f6'], [t('statResolved'), s.resolved || 0, '#22c55e'], [t('statPending'), pending, '#eab308']];
  const features = [
    ['🔒', 'rgba(234,179,8,0.15)', '#eab308', t('f1t'), t('f1d')],
    ['🤖', 'rgba(37,99,235,0.15)', '#3b82f6', t('f2t'), t('f2d')],
    ['🧑', 'rgba(168,85,247,0.15)', '#a855f7', t('f3t'), t('f3d')],
    ['📎', 'rgba(249,115,22,0.15)', '#f97316', t('f4t'), t('f4d')],
    ['✅', 'rgba(34,197,94,0.15)', '#22c55e', t('f5t'), t('f5d')],
    ['👁️', 'rgba(244,63,94,0.15)', '#f43f5e', t('f6t'), t('f6d')],
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
      <section style={{ textAlign: 'center', padding: '56px 0 32px' }}>
        <span style={{ display: 'inline-block', fontSize: 13, color: '#93c5fd', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.35)', borderRadius: 999, padding: '7px 18px' }}>{t('heroBadge')}</span>
        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, margin: '26px 0 0' }}>
          {t('heroTitle1')}<br /><span style={{ color: '#3b82f6' }}>{t('heroTitle2')}</span>
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: 560, margin: '22px auto 0', fontSize: 16, lineHeight: 1.7 }}>{t('heroSubtitle')}</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <Link href="/file" style={{ ...btn, background: '#2563eb', color: '#fff' }}>{t('fileBtn')}</Link>
          <Link href="/complaints" style={{ ...btn, border: '1px solid #334155', color: '#e2e8f0' }}>{t('viewBtn')}</Link>
          <Link href="/login" style={{ ...btn, border: '1px solid #2563eb', color: '#60a5fa' }}>{t('loginBtn')}</Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 640, margin: '16px auto 48px' }}>
        {stats.map(([k, v, c]) => (
          <div key={k} style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{k}</div>
          </div>
        ))}
      </section>

      <section style={{ padding: '8px 0 48px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 32 }}>{t('whyTitle')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {features.map(([icon, bg, color, title, desc]) => (
            <div key={title} style={card}>
              <div style={iconBox(bg, color)}>{icon}</div>
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