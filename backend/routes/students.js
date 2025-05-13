const express = require('express');
const router = express.Router();
const db = require('../db');

// Get enrolled courses for a student
router.get('/:id/enrollments', (req, res) => {
  const studentId = req.params.id;

  const query = `
    SELECT c.course_id, c.title, c.description, e.status
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id
    WHERE e.student_id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/:id/enrollments', (req, res) => {
    const studentId = req.params.id;
  
    const query = `
      SELECT e.course_id
      FROM enrollments e
      WHERE e.student_id = ?
    `;
  
    db.query(query, [studentId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  

module.exports = router;
