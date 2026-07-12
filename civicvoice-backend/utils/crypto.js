const crypto = require('crypto');
const ALGO = 'aes-256-cbc';
const KEY = Buffer.from(process.env.ENC_KEY, 'hex'); // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  let enc = cipher.update(String(text), 'utf8', 'hex');
  enc += cipher.final('hex');
  return iv.toString('hex') + ':' + enc;
}
function decrypt(payload) {
  const [ivHex, data] = payload.split(':');
  const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(ivHex, 'hex'));
  let dec = decipher.update(data, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
function sha256(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}
function pseudoId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = 'CIT';
  for (let i = 0; i < 6; i++) s += chars[crypto.randomInt(chars.length)];
  return s; // e.g. CIT7SI21L
}
module.exports = { encrypt, decrypt, sha256, pseudoId };