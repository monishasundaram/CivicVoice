require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { init } = require('./db');

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || '').split(',').filter(Boolean).length ? process.env.CLIENT_ORIGIN.split(',') : '*' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/officer', require('./routes/officer'));
app.use('/api/chat', require('./routes/chat'));
app.get('/', (req, res) => res.json({ status: 'CivicVoice API running' }));
app.use((err, req, res, next) => res.status(400).json({ error: err.message || 'Server error' }));

const PORT = process.env.PORT || 5000;
init().then(() => app.listen(PORT, () => console.log(`CivicVoice backend on http://localhost:${PORT}`)))
  .catch(e => { console.error('DB init failed:', e.message); process.exit(1); });