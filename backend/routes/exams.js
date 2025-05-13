const express = require('express');
const router = express.Router();
const db = require('../db');

// Create an exam for a course
router.post('/', (req, res) => {
  const { course_id, title } = req.body;
  const query = `INSERT INTO exams (course_id, title) VALUES (?, ?)`;

  db.query(query, [course_id, title], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Exam created', exam_id: result.insertId });
  });
});

// Add question + options
router.post('/:examId/questions', (req, res) => {
  const { examId } = req.params;
  const { question_text, options, correct_option_index } = req.body;

  const insertQuestion = `INSERT INTO questions (exam_id, question_text, correct_option) VALUES (?, ?, 0)`;

  db.query(insertQuestion, [examId, question_text], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const questionId = result.insertId;
    const optionInsertQuery = `INSERT INTO options (question_id, option_text) VALUES ?`;

    const optionValues = options.map(opt => [questionId, opt]);

    db.query(optionInsertQuery, [optionValues], (err, optionResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const correctOptionId = optionResult.insertId + correct_option_index;

      // Update correct_option in questions table
      const updateCorrect = `UPDATE questions SET correct_option = ? WHERE question_id = ?`;
      db.query(updateCorrect, [correctOptionId, questionId], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: 'Question and options added successfully' });
      });
    });
  });
});

// Get exams for a course
router.get('/:courseId', (req, res) => {
    const { courseId } = req.params;
  
    const query = `
      SELECT exam_id, course_id, title, duration
      FROM exams
      WHERE course_id = ?
    `;
  
    db.query(query, [courseId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // Get questions + options for an exam
router.get('/:examId/questions', (req, res) => {
    const { examId } = req.params;
  
    const questionQuery = `
      SELECT * FROM questions WHERE exam_id = ?
    `;
  
    db.query(questionQuery, [examId], (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
  
      const questionIds = questions.map(q => q.question_id);
      if (questionIds.length === 0) return res.json([]);
  
      const optionQuery = `
        SELECT * FROM options WHERE question_id IN (?)
      `;
  
      db.query(optionQuery, [questionIds], (err2, options) => {
        if (err2) return res.status(500).json({ error: err2.message });
  
        const optionsMap = {};
        options.forEach(opt => {
          if (!optionsMap[opt.question_id]) optionsMap[opt.question_id] = [];
          optionsMap[opt.question_id].push(opt);
        });
  
        const combined = questions.map(q => ({
          ...q,
          options: optionsMap[q.question_id] || []
        }));
  
        res.json(combined);
      });
    });
  });
  
  router.post('/:examId/submit', (req, res) => {
    const { examId } = req.params;
    const { student_id, answers } = req.body; // answers = { question_id: selected_option_id }
  
    const getQuestions = `
      SELECT question_id, correct_option 
      FROM questions 
      WHERE exam_id = ?
    `;
  
    db.query(getQuestions, [examId], (err, questionRows) => {
      if (err) return res.status(500).json({ error: err.message });
  
      const total = questionRows.length;
      let correct = 0;
  
      questionRows.forEach(q => {
        if (answers[q.question_id] && parseInt(answers[q.question_id]) === q.correct_option) {
          correct++;
        }
      });
  
      const score = ((correct / total) * 100).toFixed(2);
  
      const insertAttempt = `
        INSERT INTO exam_attempts (student_id, exam_id, score)
        VALUES (?, ?, ?)
      `;
  
      db.query(insertAttempt, [student_id, examId, score], (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
  
        const attemptId = result.insertId;
  
        // Prepare student answers for insertion
        const answerData = Object.entries(answers).map(([questionId, selectedOption]) => [
          attemptId, questionId, selectedOption
        ]);
  
        const insertAnswers = `
          INSERT INTO student_answers (attempt_id, question_id, selected_option)
          VALUES ?
        `;
  
        db.query(insertAnswers, [answerData], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
  
          res.json({ message: 'Submitted successfully', score });
        });
      });
    });
  });

  router.get('/:examId/summary', (req, res) => {
    const examId = req.params.examId;
    const studentId = req.query.student_id;
  
    const getLatestAttempt = `
      SELECT attempt_id, score
      FROM exam_attempts
      WHERE student_id = ? AND exam_id = ?
      ORDER BY attempt_date DESC LIMIT 1
    `;
  
    const getHighestScore = `
      SELECT MAX(score) AS best_score
      FROM exam_attempts
      WHERE student_id = ? AND exam_id = ?
    `;
  
    const getQuestionsAndOptions = `
      SELECT q.question_id, q.question_text, q.correct_option,
             o.option_id, o.option_text
      FROM questions q
      JOIN options o ON q.question_id = o.question_id
      WHERE q.exam_id = ?
    `;
  
    db.query(getLatestAttempt, [studentId, examId], (err1, latestRows) => {
      if (err1) return res.status(500).json({ error: err1.message });
      if (latestRows.length === 0) return res.json({ message: 'No attempts yet.' });
  
      const attemptId = latestRows[0].attempt_id;
      const latestScore = latestRows[0].score;
  
      db.query(getHighestScore, [studentId, examId], (err2, highRows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        const highestScore = highRows[0].best_score;
  
        db.query(getQuestionsAndOptions, [examId], (err3, questionRows) => {
          if (err3) return res.status(500).json({ error: err3.message });
  
          db.query(
            `SELECT question_id, selected_option FROM student_answers WHERE attempt_id = ?`,
            [attemptId],
            (err4, answerRows) => {
              if (err4) return res.status(500).json({ error: err4.message });
  
              // Build map of question -> selected answer
              const selectedMap = {};
              answerRows.forEach(ans => {
                selectedMap[ans.question_id] = ans.selected_option;
              });
  
              // Group question data
              const questionMap = {};
              questionRows.forEach(row => {
                if (!questionMap[row.question_id]) {
                  questionMap[row.question_id] = {
                    question_text: row.question_text,
                    correct_option: row.correct_option,
                    options: []
                  };
                }
                questionMap[row.question_id].options.push({
                  option_id: row.option_id,
                  option_text: row.option_text
                });
              });
  
              // Construct full summary
              const questionSummary = Object.entries(questionMap).map(([qid, data]) => ({
                question_id: qid,
                question_text: data.question_text,
                correct_option: data.correct_option,
                student_selected: selectedMap[qid] || null,
                options: data.options
              }));
  
              res.json({
                latestScore,
                highestScore,
                questionSummary
              });
            }
          );
        });
      });
    });
  });
  
  
module.exports = router;
