require('dotenv').config();
const nodemailer = require('nodemailer');
(async () => {
  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('App password length:', (process.env.GMAIL_APP_PASSWORD || '').length, '(should be 16)');
  const t = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
  try { await t.verify(); console.log('✅ Gmail login OK — email will work'); }
  catch (e) { console.log('❌', e.message); }
})();