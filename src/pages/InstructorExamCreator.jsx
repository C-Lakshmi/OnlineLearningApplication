import React, { useState } from 'react';

const InstructorExamCreator = ({courseId, onBack}) => {
  const [examTitle, setExamTitle] = useState('');
  const [examId, setExamId] = useState(null);

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  const createExam = async () => {
    const res = await fetch('http://localhost:8000/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId, title: examTitle }),
    });
    const data = await res.json();
    alert(data.message);
    setExamId(data.exam_id);
  };

  const addQuestion = async () => {
    const res = await fetch(`http://localhost:8000/api/exams/${examId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_text: questionText, options, correct_option_index: correctOptionIndex }),
    });
    const data = await res.json();
    alert(data.message);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectOptionIndex(0);
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Create Exam</h2>

      <input value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="Exam Title" className="border p-2 w-full" />
      <div className='flex justify-between'>
      <button
      type="button"
      onClick={onBack}
      className=" bg-gray-500 text-white px-3 py-2 rounded"
      >
        ← Back
      </button>
      <button onClick={createExam} className="bg-blue-600 text-white px-4 py-2 rounded">Create Exam</button>
      </div>

      {examId && (
        <>
          <h3 className="text-xl mt-6 font-semibold">Add Question</h3>

          <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Question Text" className="border p-2 w-full" />
          
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 mt-2">
              <input value={opt} onChange={e => {
                const copy = [...options];
                copy[i] = e.target.value;
                setOptions(copy);
              }} className="border p-2 w-full" placeholder={`Option ${i + 1}`} />
              <input type="radio" name="correct" checked={correctOptionIndex === i} onChange={() => setCorrectOptionIndex(i)} />
              <span className="text-sm mt-2">Correct</span>
            </div>
          ))}
          <div className='flex justify-between'>
          <button
          type="button"
          onClick={onBack}
          className=" bg-gray-500 text-white px-3 py-2 rounded"
          >
            ← Back
          </button>
          <button onClick={addQuestion} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Add Question</button>
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorExamCreator;

