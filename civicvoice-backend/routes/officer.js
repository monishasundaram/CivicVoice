const express = require('express');
const multer = require('multer');
const { q, one, pool } = require('../db');
const auth = require('../middleware/auth');
const { sha256 } = require('../utils/crypto');
const { uploadFile } = require('../utils/storage');
const { sendStatusEmail } = require('../utils/mailer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const officerOnly = (req, res, next) => req.user.role === 'officer' ? next() : res.status(403).json({ error: 'Officers only.' });
const STATUSES = ['Filed', 'Under Review', 'In Progress', 'Resolved'];

router.get('/complaints', auth, officerOnly, async (req, res) => {
  const all = req.query.all === '1';
  const rows = (all || !req.user.department)
    ? await q('SELECT * FROM complaints ORDER BY id DESC')
    : await q('SELECT * FROM complaints WHERE department=$1 ORDER BY id DESC', [req.user.department]);
  res.json({ complaints: rows, department: req.user.department });
});

router.post('/complaints/:id/status', auth, officerOnly, async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  const c = await one('SELECT * FROM complaints WHERE id=$1', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'Not found.' });
  await pool.query('UPDATE complaints SET status=$1 WHERE id=$2', [status, c.id]);
  const sig = sha256(c.id + '|' + status + '|' + req.user.id + '|' + Date.now());
  await pool.query('INSERT INTO actions (complaint_id,officer_id,action_type,description,digital_signature) VALUES ($1,$2,$3,$4,$5)',
    [c.id, req.user.id, 'STATUS_CHANGE', `Status changed to ${status} by ${req.user.name}`, sig]);
  const cit = await one('SELECT email FROM citizens WHERE pseudo_id=$1', [c.pseudo_citizen_id]);
  if (cit?.email) sendStatusEmail(cit.email, { number: c.complaint_number, title: c.title, status, officer: req.user.name });
  res.json({ message: 'Status updated.', status });
});

router.post('/complaints/:id/action', auth, officerOnly, upload.single('photo'), async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'Description required.' });
  const c = await one('SELECT * FROM complaints WHERE id=$1', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'Not found.' });
  let photo = null;
  if (req.file) { try { photo = await uploadFile(req.file.buffer, 'action-' + Date.now() + '-' + req.file.originalname.replace(/\s+/g, '_'), req.file.mimetype); } catch {} }
  const sig = sha256(c.id + '|' + description + '|' + req.user.id + '|' + Date.now());
  await pool.query('INSERT INTO actions (complaint_id,officer_id,action_type,description,photo_path,digital_signature) VALUES ($1,$2,$3,$4,$5,$6)',
    [c.id, req.user.id, 'UPDATE', description, photo, sig]);
  res.json({ message: 'Action logged.', signature: sig });
});

module.exports = router;