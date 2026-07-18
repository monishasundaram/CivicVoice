'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLang } from '../lib/i18n';

export default function Nav() {
  const { lang, setLang, t } = useLang();
  const [pid, setPid] = useState(null);
  useEffect(() => { setPid(localStorage.getItem('pseudo_id')); }, []);
  const link = { color: '#cbd5e1', textDecoration: 'none', fontSize: 14 };
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '16px 24px', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, background: '#080c16', zIndex: 50 }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#e2e8f0' }}>
        <span style={{ background: '#2563eb', color: '#fff', width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>CV</span>
        <span style={{ fontWeight: 700, fontSize: 17 }}>CivicVoice</span>
      </Link>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link href="/complaints" style={link}>{t('viewComplaints')}</Link>
        <Link href="/profile" style={link}>{t('profile')}</Link>
        <Link href="/admin" style={link}>{t('admin')}</Link>
        <Link href="/map" style={link}>{t('map')}</Link>
        <Link href="/officer" style={link}>{t('officer')}</Link>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '6px 8px', fontSize: 13 }}>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
        </select>
        <Link href={pid ? '/profile' : '/login'} style={{ ...link, border: '1px solid #334155', padding: '7px 16px', borderRadius: 9 }}>{pid || t('login')}</Link>
        <Link href="/file" style={{ background: '#2563eb', color: '#fff', padding: '7px 16px', borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{t('fileComplaint')}</Link>
      </div>
    </nav>
  );
}