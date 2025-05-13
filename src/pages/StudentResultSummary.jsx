import React, { useEffect, useState } from 'react';

const StudentResultSummary = ({ courseId, onBack }) => {
  const [results, setResults] = useState([]);
  const studentId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

  useEffect(() => {
    fetch(`http://localhost:8000/api/results/students/${studentId}/courses/${courseId}/results`)
      .then(res => res.json())
      .then(setResults);
  }, [studentId, courseId]);

  const grouped = Array.isArray(results)
  ? results.reduce((acc, row) => {
      if (!acc[row.exam_id]) acc[row.exam_id] = { title: row.exam_title, attempts: [] };
      if (row.attempt_id) {
        acc[row.exam_id].attempts.push({ score: row.score, date: row.attempt_date });
      }
      //console.log(acc);
      return acc;
    }, {})
  : {};


  return (
    <div >
      <button onClick={onBack} className="mb-4 bg-gray-600 text-white px-4 py-2 rounded">← Back to Dashboard</button>
      <h2 className="text-xl font-bold mb-4">Result Summary</h2>

      {Object.entries(grouped).map(([examId, data]) => (
        <div key={examId} className="mb-6 border p-4 rounded shadow bg-white text-left">
          <h3 className="font-semibold text-xl text-center font-bold">{data.title}</h3>
          {data.attempts.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {data.attempts.map((a, i) => (
                <li key={i}>
                Attempt {i + 1}: <b>{a.score}%</b> on{" "}
                {a.date ? new Date(a.date).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata"}) : "Unknown"}
              </li>              
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No attempts yet.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentResultSummary;
