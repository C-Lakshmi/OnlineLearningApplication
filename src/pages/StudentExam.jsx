import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StudentExam = ({ courseId, onBack }) => {
  const navigate = useNavigate();

  const studentId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [submitted, setSubmitted] = useState(false);

  // Fetch exam
  useEffect(() => {
    fetch(`http://localhost:8000/api/exams/${courseId}`)
      .then(res => res.json())
      .then(exams => {
        if (exams.length === 0) return;
        const selectedExam = exams[0];
        setExam(selectedExam);
        setTimeLeft(selectedExam.duration * 60);

        fetch(`http://localhost:8000/api/exams/${selectedExam.exam_id}/questions`)
          .then(res => res.json())
          .then(setQuestions);
      });
  }, [courseId]);

  // Timer logic
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted && exam) {
      handleSubmit();
    }
  }, [timeLeft, submitted, exam]);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSelect = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!exam || submitted) return;
    setSubmitted(true);

    const res = await fetch(`http://localhost:8000/api/exams/${exam.exam_id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, answers }),
    });

    const data = await res.json();
    alert(`Submitted! Score: ${data.score}`);
    navigate(`/exam/${exam.exam_id}/summary`);
  };

  if (!exam || questions.length === 0) return <p className="p-6">Loading exam...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-4 bg-gray-500 text-white px-4 py-2 rounded">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-2">{exam.title}</h2>
      <p className="text-red-700 font-semibold mb-4">Time Left: {formatTime()}</p>

      {questions.map((q, idx) => (
        <div key={q.question_id} className="mb-6 border p-4 rounded-md bg-white">
          <p className="font-semibold">{idx + 1}. {q.question_text}</p>
          {q.options.map(opt => (
            <label key={opt.option_id} className="block mt-1">
              <input
                type="radio"
                name={`q-${q.question_id}`}
                value={opt.option_id}
                checked={answers[q.question_id] === opt.option_id}
                onChange={() => handleSelect(q.question_id, opt.option_id)}
                disabled={submitted}
              />
              <span className="ml-2">{opt.option_text}</span>
            </label>
          ))}
        </div>
      ))}

      {!submitted && (
        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
          Submit Exam
        </button>
      )}
    </div>
  );
};

export default StudentExam;

