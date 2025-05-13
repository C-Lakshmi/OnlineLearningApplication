const express = require('express');
const router = express.Router();
const db = require('../db');

// Log content view by student
router.post('/', (req, res) => {
  const { student_id, course_id, content_url } = req.body;

  const query = `
    INSERT IGNORE INTO content_views (student_id, course_id, content_url)
    VALUES (?, ?, ?)
  `;

  db.query(query, [student_id, course_id, content_url], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'View recorded' });
  });
});

module.exports = router;
