<div align="center">

# 🛡️ CivicVoice

### Smart, Transparent, Tamper-Proof Public Grievance System

*Making public grievances impossible to ignore, impossible to fake, and impossible to quietly bury.*

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://civic-voice-mu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

[Live App](https://civic-voice-mu.vercel.app) · [Features](#-features) · [Architecture](#%EF%B8%8F-architecture) · [How to Run](#%EF%B8%8F-how-to-run)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Architecture](#%EF%B8%8F-architecture)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [How to Run](#%EF%B8%8F-how-to-run)
- [Demo Link](#-demo-link)
- [Future Improvements](#-future-improvements)

---

## 📌 Problem Statement

Traditional complaint systems are opaque. Citizens file grievances into a black box, never knowing if anyone looked at them.

- ❌ **No accountability** — officials face no visible pressure to act.
- ❌ **No protection** for citizens reporting sensitive issues like corruption.
- ❌ **No verification** — genuine problems can't be told apart from spam or fake reports.
- ❌ **No transparency** — the public can't see what's being reported or how it's handled.
- ❌ **No permanence** — records can be quietly edited, buried, or deleted.

**CivicVoice is built to fix exactly that.**

---

## 💡 Solution

CivicVoice re-imagines the grievance pipeline around three principles: **anonymity, verification, and transparency.**

| Stakeholder | What they get |
|---|---|
| 🧑 **Citizens** | Register with Aadhaar + mobile verification, receive an anonymous Citizen ID. Real identity is encrypted and never exposed. File a complaint in 3 steps — describe & pin location, upload evidence, AI verifies it. Track status with email alerts. |
| 🧑‍💼 **Officials** | Log into a department-specific portal, see only complaints routed to them, update status with a digitally signed, permanently logged action. |
| 🌍 **The Public** | Browse every complaint, search & filter, view evidence, and follow the full timeline of official actions on a live public map + analytics dashboard. |

---

## 🏗️ Architecture

```
                        ┌─────────────────────┐
                        │      Citizens         │
                        │  (Web App / Next.js)  │
                        └──────────┬───────────┘
                                   │ HTTPS
                                   ▼
                        ┌─────────────────────┐
                        │   Next.js Frontend     │
                        │   (Vercel Deployment)  │
                        └──────────┬───────────┘
                                   │ REST API
                                   ▼
                        ┌─────────────────────┐
                        │  Node.js / Express     │
                        │   Backend (Render)     │
                        └──┬────────┬────────┬──┘
                           │        │        │
              ┌────────────┘        │        └────────────┐
              ▼                     ▼                      ▼
   ┌────────────────────┐ ┌──────────────────┐  ┌───────────────────┐
   │ Supabase PostgreSQL │ │  Google Gemini     │  │  Supabase Storage   │
   │ (Complaints, Users,  │ │ (AI verification,  │  │ (Photo/Video         │
   │  Officials, Logs)    │ │  chatbot, categ.)  │  │  Evidence)            │
   └────────────────────┘ └──────────────────┘  └───────────────────┘
              │
              ▼
   ┌─────────────────────────┐
   │  Cryptographic Hashing    │
   │  Layer (tamper-proof       │
   │  complaint records)        │
   └─────────────────────────┘
```

**Flow:**
1. Citizen submits a complaint with evidence.
2. Gemini verifies the evidence matches the issue, auto-categorizes it, and checks for duplicates.
3. A cryptographic hash is generated and stored — the record becomes tamper-proof.
4. The complaint auto-routes to the relevant department's officer portal.
5. Officials update status; every update is signed and timestamped.
6. All complaints, evidence, and action logs are publicly viewable, while citizen identity stays encrypted throughout.

---

## 🧰 Tech Stack

**Frontend:** Next.js, React
**Backend:** Node.js, Express
**Database & Storage:** Supabase (PostgreSQL + file storage)
**AI/ML:** Google Gemini (vision verification, categorization, chatbot)
**Security:** Cryptographic hashing, encryption, digital signatures
**Auth:** Aadhaar + mobile verification, Email OTP
**Deployment:** Vercel (frontend), Render (backend)

---

## ✨ Features

- 🕵️ Anonymous citizen identity with pseudonymous Citizen ID
- 📧 Email OTP login
- 📍 Live GPS + map location picker
- 📷 Mandatory photo/video evidence
- 🤖 AI proof gate (evidence authenticity verification)
- 🗂️ Automatic categorization & department routing
- 🔁 Duplicate complaint detection
- 🔐 Blockchain-style tamper-proof hashing
- ✅ Officer action portal with digitally signed updates
- 🔔 Live status tracking with email alerts
- 🗺️ Public complaint map
- 📊 Analytics dashboard (resolution rates, trends)
- 📱 QR-code complaint tracking
- 💬 AI chatbot assistant
- 🌐 Multilingual support (English, Hindi, Tamil)

---

## ⚙️ How to Run

### Prerequisites
- Node.js (v18+)
- A Supabase project (PostgreSQL + storage bucket configured)
- A Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/monishasundaram/civicvoice.git
cd civicvoice
```

### 2. Set up the backend
```bash
cd backend
npm install
```
Create a `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
EMAIL_SMTP_HOST=your_smtp_host
EMAIL_SMTP_USER=your_smtp_user
EMAIL_SMTP_PASS=your_smtp_password
```
Run it:
```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
```
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Run it:
```bash
npm run dev
```

### 4. Open the app
Visit `http://localhost:3000`.

---

## 🔗 Demo Link

**Live App:** [https://civic-voice-mu.vercel.app](https://civic-voice-mu.vercel.app)

---

## 🚀 Future Improvements

- 📲 SMS-based alerts for citizens without regular email access
- 📱 Native mobile app (Android/iOS)
- 🏛️ Direct integration with government department APIs
- ⚡ Sentiment/urgency scoring to prioritize critical complaints
- 🔓 Public API for researchers and journalists
- 📶 Offline-first complaint filing for low-connectivity areas
- 🌏 Expanded language support beyond English, Hindi, and Tamil
- 🏅 Reputation/verification badges for trustworthy officials

---

<div align="center">

**CivicVoice — your voice, made public and permanent.**

⭐ If you find this project interesting, consider giving it a star!

</div>
