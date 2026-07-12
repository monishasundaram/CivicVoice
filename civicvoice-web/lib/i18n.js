'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const DICT = {
  en: {
    viewComplaints: 'View Complaints', profile: 'Profile', admin: 'Admin', officer: 'Officer', login: 'Login', fileComplaint: 'File Complaint',
    heroBadge: 'Blockchain Powered • Tamper Proof • 100% Transparent', heroTitle1: 'Your Voice.', heroTitle2: 'Public Record.',
    heroSubtitle: 'File grievances about public issues. Every complaint is permanently recorded and tamper-proof. Every action by officials is verified and visible to all.',
    fileBtn: 'File a Complaint', viewBtn: 'View All Complaints', loginBtn: 'Login / Register',
    statTotal: 'Total Complaints', statResolved: 'Resolved', statPending: 'Pending', whyTitle: 'Why CivicVoice?',
    f1t: 'Tamper Proof', f1d: 'Every complaint is hashed with SHA-256. Nobody can edit or delete it.',
    f2t: 'AI Verified', f2d: 'AI checks every complaint for fake evidence before it goes live.',
    f3t: 'Stay Anonymous', f3d: 'Your identity is encrypted. Public only sees your pseudonymous ID.',
    f4t: 'Proof Required', f4d: 'Photo or video evidence is mandatory. No proof means no complaint.',
    f5t: 'Proof of Action', f5d: 'Every officer action is digitally signed and timestamped.',
    f6t: 'Full Transparency', f6d: 'Anyone can view all complaints and their full resolution history.',
    footer: 'CivicVoice — Smart Transparent Public Grievance System © 2026',
  },
  hi: {
    viewComplaints: 'शिकायतें देखें', profile: 'प्रोफ़ाइल', admin: 'एडमिन', officer: 'अधिकारी', login: 'लॉगिन', fileComplaint: 'शिकायत दर्ज करें',
    heroBadge: 'ब्लॉकचेन संचालित • छेड़छाड़ रहित • 100% पारदर्शी', heroTitle1: 'आपकी आवाज़.', heroTitle2: 'सार्वजनिक रिकॉर्ड.',
    heroSubtitle: 'सार्वजनिक समस्याओं की शिकायत दर्ज करें। हर शिकायत स्थायी रूप से दर्ज और छेड़छाड़ रहित होती है। अधिकारियों की हर कार्रवाई सत्यापित और सभी को दिखती है।',
    fileBtn: 'शिकायत दर्ज करें', viewBtn: 'सभी शिकायतें देखें', loginBtn: 'लॉगिन / रजिस्टर',
    statTotal: 'कुल शिकायतें', statResolved: 'हल हुई', statPending: 'लंबित', whyTitle: 'CivicVoice क्यों?',
    f1t: 'छेड़छाड़ रहित', f1d: 'हर शिकायत SHA-256 से हैश की जाती है। कोई इसे बदल या हटा नहीं सकता।',
    f2t: 'AI सत्यापित', f2d: 'AI हर शिकायत के नकली सबूत की जाँच करता है।',
    f3t: 'गुमनाम रहें', f3d: 'आपकी पहचान एन्क्रिप्टेड है। जनता केवल आपकी छद्म ID देखती है।',
    f4t: 'सबूत आवश्यक', f4d: 'फोटो या वीडियो सबूत अनिवार्य है। बिना सबूत कोई शिकायत नहीं।',
    f5t: 'कार्रवाई का प्रमाण', f5d: 'अधिकारी की हर कार्रवाई डिजिटल रूप से हस्ताक्षरित होती है।',
    f6t: 'पूर्ण पारदर्शिता', f6d: 'कोई भी सभी शिकायतें और उनका पूरा इतिहास देख सकता है।',
    footer: 'CivicVoice — स्मार्ट पारदर्शी सार्वजनिक शिकायत प्रणाली © 2026',
  },
  ta: {
    viewComplaints: 'புகார்களைக் காண்க', profile: 'சுயவிவரம்', admin: 'நிர்வாகி', officer: 'அதிகாரி', login: 'உள்நுழைவு', fileComplaint: 'புகார் பதிவு',
    heroBadge: 'பிளாக்செயின் • சேதப்படுத்த முடியாதது • 100% வெளிப்படை', heroTitle1: 'உங்கள் குரல்.', heroTitle2: 'பொது பதிவு.',
    heroSubtitle: 'பொது சிக்கல்கள் குறித்து புகார் அளியுங்கள். ஒவ்வொரு புகாரும் நிரந்தரமாக பதிவு செய்யப்பட்டு மாற்ற முடியாதது. அதிகாரிகளின் ஒவ்வொரு நடவடிக்கையும் சரிபார்க்கப்பட்டு அனைவருக்கும் தெரியும்.',
    fileBtn: 'புகார் அளிக்க', viewBtn: 'அனைத்து புகார்களும்', loginBtn: 'உள்நுழைவு / பதிவு',
    statTotal: 'மொத்த புகார்கள்', statResolved: 'தீர்க்கப்பட்டது', statPending: 'நிலுவையில்', whyTitle: 'ஏன் CivicVoice?',
    f1t: 'சேதப்படுத்த முடியாதது', f1d: 'ஒவ்வொரு புகாரும் SHA-256 மூலம் ஹாஷ் செய்யப்படுகிறது. யாரும் மாற்ற/நீக்க முடியாது.',
    f2t: 'AI சரிபார்ப்பு', f2d: 'AI ஒவ்வொரு புகாரின் போலி ஆதாரத்தை சரிபார்க்கிறது.',
    f3t: 'அநாமதேயமாக இருங்கள்', f3d: 'உங்கள் அடையாளம் மறைகுறியாக்கப்பட்டது. பொதுமக்கள் உங்கள் புனைபெயர் ID மட்டுமே காண்பர்.',
    f4t: 'ஆதாரம் அவசியம்', f4d: 'புகைப்படம் அல்லது வீடியோ ஆதாரம் கட்டாயம்.',
    f5t: 'நடவடிக்கை ஆதாரம்', f5d: 'ஒவ்வொரு அதிகாரி நடவடிக்கையும் டிஜிட்டல் கையொப்பமிடப்படுகிறது.',
    f6t: 'முழு வெளிப்படைத்தன்மை', f6d: 'யார் வேண்டுமானாலும் அனைத்து புகார்களையும் காணலாம்.',
    footer: 'CivicVoice — ஸ்மார்ட் வெளிப்படையான பொது புகார் அமைப்பு © 2026',
  },
};

const Ctx = createContext(null);
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');
  useEffect(() => { const s = localStorage.getItem('lang'); if (s) setLangState(s); }, []);
  function setLang(l) { setLangState(l); localStorage.setItem('lang', l); }
  const t = (key) => (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
export function useLang() { return useContext(Ctx) || { lang: 'en', setLang: () => {}, t: (k) => k }; }