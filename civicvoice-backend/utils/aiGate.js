const sizeOf = require('image-size');
const ExifParser = require('exif-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const SPAM_WORDS = ['asdf', 'lorem', 'xxxx', 'qwerty', 'aaaa', 'blah', 'test test'];

function checkText(title, description) {
  const desc = (description || '').trim();
  const words = desc.split(/\s+/).filter(Boolean);
  if (words.length < 10) return { ok: false, reason: `Description must be at least 10 words (found ${words.length}).` };
  const lower = desc.toLowerCase();
  for (const w of SPAM_WORDS) if (lower.includes(w)) return { ok: false, reason: `Description contains spam/placeholder text: "${w}".` };
  const freq = {};
  for (const w of words) { const k = w.toLowerCase(); freq[k] = (freq[k] || 0) + 1; }
  if (Math.max(...Object.values(freq)) > words.length * 0.5) return { ok: false, reason: 'Description is too repetitive / not meaningful.' };
  if (Object.keys(freq).length < 5) return { ok: false, reason: 'Description is not descriptive enough.' };
  return { ok: true };
}

function checkImage(buffer, mimetype) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  if (!allowed.includes(mimetype)) return { ok: false, reason: `File type ${mimetype} not allowed.` };
  if (mimetype === 'video/mp4') return { ok: true, authentic: true };
  if (buffer.length < 50 * 1024) return { ok: false, reason: `Image too small (${Math.round(buffer.length / 1024)}KB, min 50KB).` };
  let dim;
  try { dim = sizeOf(buffer); } catch { return { ok: false, reason: 'Could not read image dimensions.' }; }
  if (dim.width < 200 || dim.height < 200) return { ok: false, reason: `Resolution too low (${dim.width}x${dim.height}, min 200x200).` };
  let hasExif = false;
  if (mimetype === 'image/jpeg') {
    try { const r = ExifParser.create(buffer).parse(); hasExif = !!(r.tags && (r.tags.Make || r.tags.Model || r.tags.DateTimeOriginal)); } catch {}
  }
  return { ok: true, authentic: hasExif };
}

// REAL AI: is this image genuine evidence of the reported grievance?
async function checkImageContent(buffer, mimetype, category, title) {
  if (!genAI) { console.log('[AI vision] SKIPPED — no GEMINI_API_KEY'); return { ok: true, skipped: true, category }; }
  if (mimetype === 'video/mp4') return { ok: true, category };
  const MODEL = 'gemini-flash-latest';
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const prompt = `You verify photo evidence for an Indian public-grievance complaint system.
User-picked category: "${category}". Title: "${title}".
1) Decide if the image is a genuine real-world photo showing a public civic problem (potholes/broken road,
water leakage/scarcity, damaged electric lines/poles, garbage/blocked drains, etc.). REJECT screenshots,
app/desktop windows, selfies, memes, food, celebrities, documents, or anything not showing a public problem.
2) Classify the true problem into exactly one of: Roads, Water, Electricity, Sanitation, Corruption, Other.
Respond ONLY with strict JSON: {"relevant": true|false, "reason": "short reason", "category": "one of the list"}`;
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: mimetype, data: buffer.toString('base64') } },
    ]);
    const txt = result.response.text().trim().replace(/```json|```/g, '');
    const parsed = JSON.parse(txt);
    console.log('[AI vision]', category, '->', JSON.stringify(parsed));
    return { ok: parsed.relevant === true, reason: parsed.reason || 'Image not relevant to the complaint.', category: parsed.category || category };
  } catch (e) {
    console.error('[AI vision] ERROR (' + MODEL + '):', e.message);
    return { ok: false, reason: 'AI could not verify this image. Please upload a clear real photo of the problem.', category };
  }
}
function aiScore(textOk, image, content) {
  let s = 0.4;
  if (textOk) s += 0.2;
  if (image.authentic) s += 0.2;
  if (content && content.ok && !content.skipped) s += 0.2;
  return Math.min(1, +s.toFixed(2));
}

function _tokens(s) { return new Set((s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)); }
function _jaccard(a, b) { const A = _tokens(a), B = _tokens(b); if (!A.size || !B.size) return 0; let i = 0; for (const x of A) if (B.has(x)) i++; return i / (A.size + B.size - i); }
function _latlng(loc) { const m = (loc || '').match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/); return m ? { lat: +m[1], lng: +m[2] } : null; }
function _distM(a, b) { const R = 6371000, r = x => x * Math.PI / 180; const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng); const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); }

// Returns { number, sim } if a likely duplicate exists among rows, else null
function findDuplicate(cand, rows) {
  const candText = cand.title + ' ' + cand.description;
  const candLoc = _latlng(cand.location);
  for (const r of rows) {
    if (r.category !== cand.category) continue;
    const sim = _jaccard(candText, r.title + ' ' + r.description);
    let near = false;
    if (candLoc) { const rl = _latlng(r.location); if (rl && _distM(candLoc, rl) < 150) near = true; }
    else if (cand.location && r.location && cand.location.toLowerCase() === r.location.toLowerCase()) near = true;
    if (sim > 0.55 || (sim > 0.3 && near)) return { number: r.complaint_number, sim: +sim.toFixed(2) };
  }
  return null;
}

module.exports = { checkText, checkImage, checkImageContent, findDuplicate, aiScore };