const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all courses created by instructor
router.get('/:id/courses', (req, res) => {
  const instructorId = req.params.id;

  const query = `SELECT * FROM courses WHERE instructor_id = ?`;

  db.query(query, [instructorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
