import React, { useState, useEffect } from 'react';

const InstructorRequirementsForm = ({courseId, onBack}) => {
  const [minScore, setMinScore] = useState(60);
  const [minPassed, setMinPassed] = useState(1);
  const [requireAllViewed, setRequireAllViewed] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    fetch(`http://localhost:8000/api/course-requirements/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (!data) return;
        setMinScore(data.min_exam_score);
        setMinPassed(data.min_passed_exams);
        setRequireAllViewed(data.require_all_content_viewed === 1);
      });
  }, [courseId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/api/course-requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        min_exam_score: minScore,
        min_passed_exams: minPassed,
        require_all_content_viewed: requireAllViewed
      })
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto border p-6 rounded space-y-4">
  <h2 className="text-2xl font-bold">Set Course Completion Requirements</h2>


  <div>
    <label className="block font-semibold mb-1">Minimum Exam Score Required (%)</label>
    <input
      type="number"
      placeholder="e.g. 60"
      value={minScore}
      onChange={e => setMinScore(e.target.value)}
      className="border p-2 w-full"
    />
  </div>

  <div>
    <label className="block font-semibold mb-1">Minimum Exams to Pass</label>
    <input
      type="number"
      placeholder="e.g. 2"
      value={minPassed}
      onChange={e => setMinPassed(e.target.value)}
      className="border p-2 w-full"
    />
  </div>

  <div>
    <label className="block font-semibold mb-1 mb-2">
      <input
        type="checkbox"
        checked={requireAllViewed}
        onChange={e => setRequireAllViewed(e.target.checked)}
        className="mr-2"
      />
      Require all course content to be viewed
    </label>
  </div>
  <div className='flex justify-between'>
      <button
      type="button"
      onClick={onBack}
      className=" bg-gray-500 text-white px-3 py-2 rounded"
      >
        ← Back
      </button>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Requirements
      </button>
      </div>
</form>
  );
};

export default InstructorRequirementsForm;
