import React, { useState } from 'react';

const CourseRatingForm = ({ courseId, onBack }) => {
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const studentId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/api/course_ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, course_id: courseId, rating, review })
    });

    const data = await res.json();
    alert(data.message || data.error);
    onBack();
  };

  return (
    <div className="mt-4">
      <button onClick={onBack} className="mb-4 bg-gray-600 text-white px-4 py-2 rounded">← Back to Dashboard</button>
      <h2 className="text-xl font-bold mb-4">Rate This Course</h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto text-center">
  <div>
    <label className="block font-bold mb-1">Rating (1–5):</label>
    <input
      type="number"
      min="1"
      max="5"
      value={rating}
      onChange={e => setRating(e.target.value)}
      className="border p-2 w-2/3 mx-auto block"
      required
    />
  </div>

  <div>
    <label className="block font-bold mb-1">Review:</label>
    <textarea
      value={review}
      onChange={e => setReview(e.target.value)}
      className="border p-2 w-2/3 mx-auto block"
      required
    />
  </div>

  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit Rating</button>
</form>
    </div>
  );
};

export default CourseRatingForm;
