
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
    const { student_id, course_id, rating, review } = req.body;
  
    const query = `
      INSERT INTO course_ratings (student_id, course_id, rating, review)
      VALUES (?, ?, ?, ?)
    `;
  
    db.query(query, [student_id, course_id, rating, review], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Rating submitted successfully' });
    });
  });

  // GET /api/course_ratings/:courseId
router.get('/:courseId', (req, res) => {
  const { courseId } = req.params;
  const query = `
    SELECT rating, review, created_at, student_id 
    FROM course_ratings 
    WHERE course_id = ?
    ORDER BY created_at DESC
  `;
  db.query(query, [courseId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

  
  module.exports = router