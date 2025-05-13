const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Upload route
router.post('/file', upload.single('file'), (req, res) => {
  const { course_id, content_type } = req.body;
  const fileUrl = `http://localhost:8000/uploads/${req.file.filename}`;

  const query = `
    INSERT INTO course_content (course_id, content_type, content_url)
    VALUES (?, ?, ?)
  `;

  db.query(query, [course_id, content_type, fileUrl], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'File uploaded successfully', url: fileUrl });
  });
});

router.post('/text-link', (req, res) => {
  const { course_id, content_type, content_value } = req.body;
  const insert = `
    INSERT INTO course_content (course_id, content_type, content_url)
    VALUES (?, ?, ?)
  `;
  db.query(insert, [course_id, content_type, content_value], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Content added successfully' });
  });
});


module.exports = router;
