const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');

// REGISTER USER
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const q = 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)';
  db.query(q, [name, email, hash, role], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Registered successfully' });
  });
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const q = 'SELECT * FROM users WHERE email = ?';
  db.query(q, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, results[0].password_hash);
    if (match) {
      res.json({ message: 'Login successful', user: results[0] });  // You can send only specific fields if needed
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  });
});

module.exports = router;
