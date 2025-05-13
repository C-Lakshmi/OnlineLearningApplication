const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
    const { course_id, instructorId, message } = req.body;
    const query = `
      INSERT INTO announcements (course_id, instructor_id, message)
      VALUES (?, ?, ?)
    `;
    db.query(query, [course_id, instructorId, message], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Announcement posted' });
    });
  });

  router.get('/:courseId', (req, res) => {
    const { courseId } = req.params;
    const query = `
      SELECT message, created_at 
      FROM announcements 
      WHERE course_id = ? 
      ORDER BY created_at DESC
    `;
    db.query(query, [courseId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  module.exports = router
  