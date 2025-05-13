const express = require('express');
const router = express.Router();
const db = require('../db');

// Check if student is eligible and issue certificate
router.post('/check-and-issue', (req, res) => {
    const { student_id, course_id } = req.body;
  
    const checkCert = `
      SELECT * FROM certificates WHERE student_id = ? AND course_id = ?
    `;
  
    db.query(checkCert, [student_id, course_id], (err, certRows) => {
      if (err) return res.status(500).json({ error: err.message });
  
      if (certRows.length > 0) {
        return res.json({
          eligible: true,
          alreadyIssued: true,
          message: 'Certificate already issued'
        });
      }
  
      const getRequirements = `
        SELECT * FROM course_requirements WHERE course_id = ?
      `;
  
      db.query(getRequirements, [course_id], (err2, [reqs]) => {
        if (err2) return res.status(500).json({ error: err2.message });

        if (!reqs) {
          console.log(`ℹ️ No requirements set for course_id=${course_id}`);
          return res.json({
            eligible: false,
            reason: 'Course requirements not set'
          });
        }        
  
        const getExams = `
          SELECT COUNT(*) AS passed
          FROM exam_attempts ea
          JOIN exams e ON ea.exam_id = e.exam_id
          WHERE ea.student_id = ? AND e.course_id = ? AND ea.score >= ?
        `;
  
        db.query(getExams, [student_id, course_id, reqs.min_exam_score], (err3, [exams]) => {
          if (err3) return res.status(500).json({ error: err3.message });
  
          const passedExams = exams.passed;
  
          if (passedExams < reqs.min_passed_exams) {
            return res.json({ eligible: false, reason: 'Not enough exams passed' });
          }
  
          const checkContentView = reqs.require_all_content_viewed
            ? `
              SELECT COUNT(*) AS total_required,
                     (SELECT COUNT(*) FROM content_views WHERE student_id = ? AND course_id = ?) AS total_viewed
              FROM course_content
              WHERE course_id = ?
            `
            : null;
  
          const issueCertificate = () => {
            const insertCert = `
              INSERT INTO certificates (student_id, course_id)
              VALUES (?, ?)
            `;
            db.query(insertCert, [student_id, course_id], (err4) => {
              if (err4) return res.status(500).json({ error: err4.message });
              return res.json({ eligible: true, message: 'Certificate issued' });
            });
          };
  
          if (checkContentView) {
            db.query(checkContentView, [student_id, course_id, course_id], (err5, [result]) => {
              if (err5) return res.status(500).json({ error: err5.message });
  
              if (result.total_viewed < result.total_required) {
                return res.json({ eligible: false, reason: 'Not all content viewed' });
              }
  
              issueCertificate();
            });
          } else {
            issueCertificate();
          }
        });
      });
    });
  });  

router.get('/:studentId', (req, res) => {
    const { studentId } = req.params;
  
    const query = `
      SELECT c.course_id, cs.title, c.issued_at
      FROM certificates c
      JOIN courses cs ON c.course_id = cs.course_id
      WHERE c.student_id = ?
    `;
  
    db.query(query, [studentId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  

module.exports = router;
