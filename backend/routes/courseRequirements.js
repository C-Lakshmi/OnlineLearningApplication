const express = require('express');
const router = express.Router();
const db = require('../db');

// Insert or update course requirements
router.post('/', (req, res) => {
  const { course_id, min_exam_score, min_passed_exams, require_all_content_viewed } = req.body;

  const query = `
    INSERT INTO course_requirements (course_id, min_exam_score, min_passed_exams, require_all_content_viewed)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      min_exam_score = VALUES(min_exam_score),
      min_passed_exams = VALUES(min_passed_exams),
      require_all_content_viewed = VALUES(require_all_content_viewed)
  `;

  db.query(query, [course_id, min_exam_score, min_passed_exams, require_all_content_viewed], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Requirements saved successfully' });
  });
});

router.get('/:courseId', (req, res) => {
    const { courseId } = req.params;
    const query = `SELECT * FROM course_requirements WHERE course_id = ?`;
    db.query(query, [courseId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.json(null);
      res.json(result[0]);
    });
  });
  

module.exports = router;
