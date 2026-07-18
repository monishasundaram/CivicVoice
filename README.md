# 🛡️ CivicVoice — Smart Transparent Public Grievance System

**🔗 Live:** https://civic-voice-mu.vercel.app

CivicVoice is a civic-tech platform that lets Indian citizens report public problems — broken roads, water scarcity, power failures, poor sanitation, and corruption — in a way that is **anonymous, AI-verified, tamper-proof, and open to everyone**.

The goal is simple: make public grievances impossible to ignore, impossible to fake, and impossible to quietly bury. Every complaint is verified by AI, permanently recorded with a cryptographic fingerprint, and visible to the whole public along with every action officials take on it — while the citizen who filed it stays completely anonymous.

---

## The Problem

Traditional complaint systems are opaque. Citizens file grievances into a black box, never knowing if anyone looked at them. There is no accountability for officials, no protection for the person complaining, and no way to tell a genuine problem from a fake one. CivicVoice is built to fix exactly that.

---

## How It Works

**For Citizens**
- Register securely with Aadhaar and mobile verification, then receive a random anonymous Citizen ID. Your real name, phone, and Aadhaar are encrypted and never shown to anyone.
- File a complaint in three guided steps: describe the issue and pin the exact location on a live map, upload photo or video evidence, and let the AI proof gate verify it.
- Track your complaint publicly and get an email every time its status changes.

**For Officials**
- Officers log into a department-specific portal and only see complaints routed to them.
- They update the complaint's status and record the action they took — each action is digitally signed and permanently saved.

**For the Public**
- Anyone can browse every complaint, search and filter them, view the evidence, and follow the complete timeline of official actions.
- A public map shows where problems are being reported, and analytics reveal resolution rates and trends.

---

## What Makes It Different

- **Truly anonymous** — the public only ever sees a pseudonymous ID; personal identity is encrypted.
- **AI-verified evidence** — an AI vision model checks that each photo genuinely shows the reported problem and rejects fake, irrelevant, or spam submissions.
- **Automatically categorized and routed** — complaints are classified and sent to the right government department without manual sorting.
- **Duplicate detection** — repeated reports of the same issue are automatically caught.
- **Tamper-proof records** — every complaint carries a unique cryptographic hash, so it can never be secretly edited or deleted; not even administrators can alter it.
- **Full transparency** — every official action is signed, timestamped, and public.
- **Accessible to all** — available in English, Hindi, and Tamil, with a built-in AI assistant to guide users.

---

## Key Features at a Glance

Anonymous citizen identity · Email OTP login · Live GPS + map location picker · Mandatory photo/video evidence · AI proof gate · Automatic categorization · Duplicate detection · Blockchain-style hashing · Department assignment · Officer action portal · Live status tracking with email alerts · Public complaint map · Analytics dashboard · QR-code tracking · AI chatbot · Multilingual support.

---

## Technology

Built with **Next.js** (frontend) and **Node.js / Express** (backend), powered by a **Supabase PostgreSQL** database and file storage, with **Google Gemini** for AI verification and assistance. Deployed on **Vercel** and **Render**.

---

*CivicVoice — your voice, made public and permanent.*
