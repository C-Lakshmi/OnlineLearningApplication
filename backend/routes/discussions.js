const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
    const { course_id, user_id, user_role, post_text } = req.body;
    const query = `
      INSERT INTO discussions (course_id, user_id, user_role, post_text)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [course_id, user_id, user_role, post_text], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Discussion posted' });
    });
  });

router.get('/:courseId', (req, res) => {
    const { courseId } = req.params;
    const query = `
    SELECT d.user_id, d.user_role, d.post_text, d.created_at, u.name
    FROM discussions d
    JOIN users u ON d.user_id = u.user_id
    WHERE d.course_id = ?
    ORDER BY d.created_at DESC
    `;

    db.query(query, [courseId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  module.exports = router