const nodemailer = require('nodemailer');

const transporter = (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } })
  : null;

const shell = (inner) => `<div style="background:#0f172a;padding:32px;font-family:Arial,sans-serif;color:#e2e8f0">
  <div style="max-width:480px;margin:0 auto;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:28px">
    <div style="font-size:22px;font-weight:bold;color:#3b82f6;margin-bottom:16px">🛡️ CivicVoice</div>
    ${inner}
    <p style="color:#64748b;font-size:12px;margin-top:24px">CivicVoice — Smart Transparent Public Grievance System</p>
  </div></div>`;

async function sendOtpEmail(to, otp) {
  if (!transporter) throw new Error('Email not configured (missing GMAIL_USER/GMAIL_APP_PASSWORD).');
  await transporter.sendMail({
    from: `CivicVoice <${process.env.GMAIL_USER}>`, to,
    subject: 'Your CivicVoice verification code',
    html: shell(`<p>Your one-time verification code is:</p>
      <div style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#fff;background:#0b1424;border:1px solid #334155;border-radius:12px;padding:16px;text-align:center;margin:12px 0">${otp}</div>
      <p style="color:#94a3b8;font-size:14px">This code expires soon. Do not share it with anyone.</p>`),
  });
}

async function sendWelcomeEmail(to, pseudoId, name) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: `CivicVoice <${process.env.GMAIL_USER}>`, to,
      subject: 'Welcome to CivicVoice 🎉',
      html: shell(`<p>Hi ${name || 'Citizen'},</p>
        <p>Your CivicVoice account is ready. Your public identity is your anonymous Citizen ID:</p>
        <div style="font-size:24px;font-weight:bold;color:#3b82f6;background:#0b1424;border:1px solid #334155;border-radius:12px;padding:14px;text-align:center;margin:12px 0">${pseudoId}</div>
        <p style="color:#94a3b8;font-size:14px">Your name, phone, and Aadhaar are encrypted and never shown publicly. You can now file tamper-proof, AI-verified complaints.</p>`),
    });
  } catch (e) { console.error('Welcome email failed:', e.message); }
}

async function sendStatusEmail(to, { number, title, status, officer }) {
  if (!transporter) return;
  const base = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',')[0];
  const colors = { 'Filed': '#64748b', 'Under Review': '#eab308', 'In Progress': '#3b82f6', 'Resolved': '#22c55e' };
  try {
    await transporter.sendMail({
      from: `CivicVoice <${process.env.GMAIL_USER}>`, to,
      subject: `Update on complaint ${number} — ${status}`,
      html: shell(`<p>Your complaint has a new status update:</p>
        <p style="font-size:15px"><b>${title}</b><br><span style="color:#94a3b8">${number}</span></p>
        <div style="display:inline-block;background:${colors[status] || '#334155'};color:#fff;padding:8px 16px;border-radius:999px;font-weight:bold;margin:8px 0">${status}</div>
        <p style="color:#94a3b8;font-size:14px">Updated by ${officer || 'an officer'}.</p>
        <a href="${base}/complaints/${number}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:10px;margin-top:8px">View Complaint</a>`),
    });
  } catch (e) { console.error('Status email failed:', e.message); }
}

module.exports = { sendOtpEmail, sendWelcomeEmail, sendStatusEmail };