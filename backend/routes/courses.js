const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all available courses
router.get('/', (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { instructor_id, title, description, price } = req.body;

  const query = `
    INSERT INTO courses (instructor_id, title, description, price)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [instructor_id, title, description, price], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Course created successfully' });
  });
});


// Get course content for a specific course
router.get('/:id/content', (req, res) => {
  const courseId = req.params.id;

  const query = `
    SELECT content_type, content_url, uploaded_at
    FROM course_content
    WHERE course_id = ?
    ORDER BY uploaded_at ASC
  `;

  db.query(query, [courseId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
