import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const StudentExamSummary = () => {
    const navigate = useNavigate();
  const { examId } = useParams();
  const studentId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/exams/${examId}/summary?student_id=${studentId}`)
      .then(res => res.json())
      .then(setSummary);
  }, [examId, studentId]);

  if (!summary) return <p className="p-6">Loading summary...</p>;
  const handleBack = () => navigate('/student-dashboard');

  return (
    <div className="p-6 max-w-3xl mx-auto">
        <button onClick={handleBack} className="mb-4 bg-gray-500 text-white px-4 py-2 rounded">
        ← Back to Dashboard
      </button>
      <h2 className="text-2xl font-bold mb-4">Exam Summary</h2>

      <p>🕓 <b>Latest Score:</b> {summary.latestScore}</p>
      <p>🏆 <b>Highest Score:</b> {summary.highestScore}</p>

      <div className="mt-6">
        {summary.questionSummary.map((q, i) => (
          <div key={q.question_id} className="border p-4 rounded mb-4">
            <p className="font-semibold">{i + 1}. {q.question_text}</p>
            <ul className="ml-4 mt-2 list-disc">
            {q.options.map(opt => {
            const isCorrect = opt.option_id == q.correct_option;
            const isSelected = opt.option_id == q.student_selected;

            return (
                <li key={opt.option_id} className={
                isCorrect ? 'text-green-600 font-semibold' :
                isSelected ? 'text-red-500' : ''
                }>
                {opt.option_text}
                {isCorrect && ' ✔️'}
                {isSelected && !isCorrect && ' ❌'}
                </li>
            );
            })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentExamSummary;
