const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { one } = require('../db');
const auth = require('../middleware/auth');
const { encrypt, sha256, pseudoId } = require('../utils/crypto');
const { sendOtpEmail, sendWelcomeEmail } = require('../utils/mailer');
const router = express.Router();

const otpStore = {};
const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const maskEmail = (e) => { const [u, d] = String(e).split('@'); return d ? u.slice(0, 2) + '***@' + d : e; };

router.post('/send-otp', async (req, res) => {
  const { phone, aadhaar, email } = req.body;
  if (!/^\d{10}$/.test(phone || '')) return res.status(400).json({ error: 'Phone must be 10 digits.' });
  if (!/^\d{12}$/.test(aadhaar || '')) return res.status(400).json({ error: 'Aadhaar must be 12 digits.' });
  if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'A valid email is required.' });
  if (await one('SELECT id FROM citizens WHERE phone_hash=$1', [sha256(phone)])) return res.status(409).json({ error: 'Phone already registered. Please login.' });
  const otp = genOtp(); otpStore['reg_' + phone] = otp;
  console.log(`[REGISTER OTP] ${phone} (${email}) -> ${otp}`);
  try { await sendOtpEmail(email, otp); res.json({ message: 'OTP sent to your email.', emailed: true }); }
  catch (e) { console.error('OTP email failed:', e.message); res.json({ message: 'Email not configured.', emailed: false, devOtp: otp }); }
});

router.post('/register', async (req, res) => {
  const { name, email, phone, aadhaar, otp } = req.body;
  if (!name || !email || !phone || !aadhaar) return res.status(400).json({ error: 'All fields required.' });
  if (!/^\d{12}$/.test(aadhaar)) return res.status(400).json({ error: 'Aadhaar must be 12 digits.' });
  if (!/^\d{10}$/.test(phone)) return res.status(400).json({ error: 'Phone must be 10 digits.' });
  if (otpStore['reg_' + phone] !== otp) return res.status(400).json({ error: 'Invalid OTP. Verify your email first.' });
  const phone_hash = sha256(phone);
  if (await one('SELECT id FROM citizens WHERE phone_hash=$1', [phone_hash])) return res.status(409).json({ error: 'Phone already registered.' });
  let pid; do { pid = pseudoId(); } while (await one('SELECT id FROM citizens WHERE pseudo_id=$1', [pid]));
  const row = await one(`INSERT INTO citizens (pseudo_id,name_encrypted,phone_encrypted,phone_hash,aadhaar_encrypted,email,password_hash,aadhaar_verified)
    VALUES ($1,$2,$3,$4,$5,$6,$7,1) RETURNING id`, [pid, encrypt(name), encrypt(phone), phone_hash, encrypt(aadhaar), email, '']);
  delete otpStore['reg_' + phone];
  sendWelcomeEmail(email, pid, name);
  const token = jwt.sign({ id: row.id, pseudo_id: pid, role: 'citizen' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Registered.', pseudo_id: pid, token });
});

router.post('/login/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!/^\d{10}$/.test(phone || '')) return res.status(400).json({ error: 'Phone must be 10 digits.' });
  const row = await one('SELECT email FROM citizens WHERE phone_hash=$1', [sha256(phone)]);
  if (!row) return res.status(404).json({ error: 'No account with this phone. Please register.' });
  const otp = genOtp(); otpStore['login_' + phone] = otp;
  console.log(`[LOGIN OTP] ${phone} (${row.email}) -> ${otp}`);
  try { await sendOtpEmail(row.email, otp); res.json({ message: 'OTP sent.', emailed: true, email: maskEmail(row.email) }); }
  catch (e) { console.error('OTP email failed:', e.message); res.json({ message: 'Email not configured.', emailed: false, devOtp: otp }); }
});

router.post('/login', async (req, res) => {
  const { phone, otp } = req.body;
  const row = await one('SELECT * FROM citizens WHERE phone_hash=$1', [sha256(phone || '')]);
  if (!row) return res.status(404).json({ error: 'No account with this phone.' });
  if (otpStore['login_' + phone] !== otp) return res.status(401).json({ error: 'Invalid OTP.' });
  delete otpStore['login_' + phone];
  const token = jwt.sign({ id: row.id, pseudo_id: row.pseudo_id, role: 'citizen' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, pseudo_id: row.pseudo_id });
});

router.post('/officer/login', async (req, res) => {
  const { officerId, password } = req.body;
  const id = (officerId || '').trim();
  const row = await one('SELECT * FROM officers WHERE officer_id=$1 OR username=$1', [id]);
  if (!row || !bcrypt.compareSync(password || '', row.password_hash)) return res.status(401).json({ error: 'Invalid Officer ID or password.' });
  const token = jwt.sign({ id: row.id, name: row.name, officer_id: row.officer_id, department: row.department, role: 'officer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, name: row.name, officer_id: row.officer_id, department: row.department });
});

router.get('/me', auth, async (req, res) => {
  if (req.user.role !== 'citizen') return res.status(403).json({ error: 'Citizens only.' });
  res.json(await one('SELECT pseudo_id, aadhaar_verified, created_at FROM citizens WHERE id=$1', [req.user.id]));
});

module.exports = router;