const express = require('express');
const router = express.Router();
const db = require('../db');

// Enroll student in a course
router.post('/', (req, res) => {
  const { student_id, course_id } = req.body;

  const query = `
    INSERT INTO enrollments (student_id, course_id)
    VALUES (?, ?)
  `;

  db.query(query, [student_id, course_id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Already enrolled' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: 'Enrolled successfully!' });
  });
});

module.exports = router;
