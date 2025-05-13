const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/students/:studentId/courses/:courseId/results', (req, res) => {
    const { studentId, courseId } = req.params;
  
    const query = `
  SELECT 
    e.exam_id, 
    e.title AS exam_title,
    ea.attempt_id,
    ea.score,
    DATE_FORMAT(ea.attempt_date, '%Y-%m-%d %H:%i:%s') AS attempt_date
  FROM exams e
  LEFT JOIN exam_attempts ea 
    ON e.exam_id = ea.exam_id AND ea.student_id = ?
  WHERE e.course_id = ?
  ORDER BY e.exam_id, ea.attempt_date ASC
`;

  
    db.query(query, [studentId, courseId], (err, rows) => {
      if (err) {
        console.error("❌ SQL error:", err);
        return res.status(500).json({ error: err.message })
      };
      res.json(rows||[]);
    });
  });

  module.exports = router
  