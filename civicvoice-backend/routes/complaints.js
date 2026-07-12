const express = require('express');
const multer = require('multer');
const { q, one, pool } = require('../db');
const auth = require('../middleware/auth');
const { sha256 } = require('../utils/crypto');
const { checkText, checkImage, checkImageContent, findDuplicate, aiScore } = require('../utils/aiGate');
const { uploadFile } = require('../utils/storage');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (r, f, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(f.mimetype)) });
const genNumber = () => 'CV' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
const CATS = ['Roads', 'Water', 'Electricity', 'Sanitation', 'Corruption', 'Other'];
const DEPT = { Roads: 'Public Works Department', Water: 'Water Board', Electricity: 'Electricity Board', Sanitation: 'Sanitation Department', Corruption: 'Vigilance Cell', Other: 'General Administration' };

router.post('/', auth, upload.single('evidence'), async (req, res) => {
  if (req.user.role !== 'citizen') return res.status(403).json({ error: 'Only citizens can file complaints.' });
  const { title, category, description, location, gps_accuracy } = req.body;
  if (!title || !category || !description || !location) return res.status(400).json({ error: 'Title, category, description and location are required.' });
  const t = checkText(title, description);
  if (!t.ok) return res.status(422).json({ error: t.reason, gate: 'text' });
  if (!req.file) return res.status(400).json({ error: 'Photo/video evidence is mandatory.' });
  const buffer = req.file.buffer;
  const img = checkImage(buffer, req.file.mimetype);
  if (!img.ok) return res.status(422).json({ error: img.reason, gate: 'image' });
  const content = await checkImageContent(buffer, req.file.mimetype, category, title);
  if (!content.ok) return res.status(422).json({ error: `Irrelevant evidence detected by AI — ${content.reason}`, gate: 'content' });
  const finalCategory = CATS.includes(content.category) ? content.category : category;

  const existing = await q('SELECT complaint_number,title,description,category,location FROM complaints');
  const dup = findDuplicate({ title, description, category: finalCategory, location }, existing);
  if (dup) return res.status(409).json({ error: `Possible duplicate of complaint ${dup.number}. This issue looks already reported.`, gate: 'duplicate', duplicate: dup.number });

  let evidenceUrl;
  try { evidenceUrl = await uploadFile(buffer, Date.now() + '-' + req.file.originalname.replace(/\s+/g, '_'), req.file.mimetype); }
  catch (e) { return res.status(500).json({ error: 'Evidence upload failed: ' + e.message }); }

  const lat = req.body.lat ? parseFloat(req.body.lat) : null;
  const lng = req.body.lng ? parseFloat(req.body.lng) : null;
  const gpsVerified = gps_accuracy && gps_accuracy !== 'Low' ? 1 : 0;
  const number = genNumber();
  const created = new Date().toISOString();
  const hash = sha256(number + '|' + title + '|' + created);
  const score = aiScore(t.ok, img, content);
  const department = DEPT[finalCategory] || 'General Administration';

  const c = await one(`INSERT INTO complaints
    (complaint_number,pseudo_citizen_id,title,description,category,location,status,ai_score,blockchain_hash,department,lat,lng,created_at)
    VALUES ($1,$2,$3,$4,$5,$6,'Filed',$7,$8,$9,$10,$11,$12) RETURNING id`,
    [number, req.user.pseudo_id, title, description, finalCategory, location, score, hash, department, lat, lng, created]);
  await pool.query('INSERT INTO evidence (complaint_id,file_path,file_type,gps_verified,ai_authentic) VALUES ($1,$2,$3,$4,$5)',
    [c.id, evidenceUrl, req.file.mimetype, gpsVerified, 1]);

  res.json({ message: 'Complaint filed.', complaint_number: number, blockchain_hash: hash, ai_score: score, category: finalCategory, department });
});

router.get('/', async (req, res) => {
  const { q: search, status } = req.query;
  let sql = 'SELECT id,complaint_number,pseudo_citizen_id,title,category,location,status,lat,lng,created_at FROM complaints WHERE 1=1';
  const args = []; let n = 1;
  if (status) { sql += ` AND status=$${n++}`; args.push(status); }
  if (search) { sql += ` AND (title ILIKE $${n} OR location ILIKE $${n})`; args.push('%' + search + '%'); n++; }
  sql += ' ORDER BY id DESC';
  const complaints = await q(sql, args);
  const cnt = async (w) => (await one(`SELECT COUNT(*)::int c FROM complaints ${w}`)).c;
  res.json({ complaints, stats: {
    total: await cnt(''), under_review: await cnt("WHERE status='Under Review'"),
    in_progress: await cnt("WHERE status='In Progress'"), resolved: await cnt("WHERE status='Resolved'"),
  } });
});

router.get('/:number', async (req, res) => {
  const c = await one('SELECT * FROM complaints WHERE complaint_number=$1', [req.params.number]);
  if (!c) return res.status(404).json({ error: 'Complaint not found.' });
  res.json({
    complaint: c,
    evidence: await q('SELECT id,file_path,file_type,gps_verified,ai_authentic,uploaded_at FROM evidence WHERE complaint_id=$1', [c.id]),
    actions: await q('SELECT action_type,description,photo_path,digital_signature,created_at FROM actions WHERE complaint_id=$1 ORDER BY id ASC', [c.id]),
  });
});

module.exports = router;