const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function q(text, params) { const r = await pool.query(text, params); return r.rows; }
async function one(text, params) { const r = await pool.query(text, params); return r.rows[0] || null; }

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS citizens (
      id SERIAL PRIMARY KEY, pseudo_id TEXT UNIQUE,
      name_encrypted TEXT, phone_encrypted TEXT, phone_hash TEXT UNIQUE,
      aadhaar_encrypted TEXT, email TEXT, password_hash TEXT,
      aadhaar_verified INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
    CREATE TABLE IF NOT EXISTS officers (
      id SERIAL PRIMARY KEY, officer_id TEXT, username TEXT UNIQUE,
      name TEXT, password_hash TEXT, department TEXT);
    CREATE TABLE IF NOT EXISTS complaints (
      id SERIAL PRIMARY KEY, complaint_number TEXT UNIQUE, pseudo_citizen_id TEXT,
      title TEXT, description TEXT, category TEXT, location TEXT,
      status TEXT DEFAULT 'Filed', ai_score REAL, blockchain_hash TEXT,
      department TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION,
      created_at TIMESTAMPTZ DEFAULT now());
    CREATE TABLE IF NOT EXISTS evidence (
      id SERIAL PRIMARY KEY, complaint_id INTEGER, file_path TEXT, file_type TEXT,
      gps_verified INTEGER, ai_authentic INTEGER, uploaded_at TIMESTAMPTZ DEFAULT now());
    CREATE TABLE IF NOT EXISTS actions (
      id SERIAL PRIMARY KEY, complaint_id INTEGER, officer_id INTEGER,
      action_type TEXT, description TEXT, photo_path TEXT, digital_signature TEXT,
      created_at TIMESTAMPTZ DEFAULT now());
  `);
  const OFFICERS = [
    ['OFF-PWD-01', 'officer1', 'K. Kumar', 'Public Works Department'],
    ['OFF-WTR-01', 'officer2', 'P. Priya', 'Water Board'],
    ['OFF-ELE-01', 'officer3', 'R. Rajesh', 'Electricity Board'],
    ['OFF-SAN-01', 'officer4', 'M. Meena', 'Sanitation Department'],
  ];
  for (const [oid, uname, name, dept] of OFFICERS) {
    await pool.query(`INSERT INTO officers (officer_id,username,name,password_hash,department)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT (username) DO UPDATE SET officer_id=$1, name=$3, department=$5`,
      [oid, uname, name, bcrypt.hashSync('officer123', 10), dept]);
  }
  console.log('Postgres ready');
}

module.exports = { pool, q, one, init };