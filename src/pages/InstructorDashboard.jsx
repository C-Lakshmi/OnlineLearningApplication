import React, { useState, useEffect } from 'react';
import InstructorExamCreator from './InstructorExamCreator';
import InstructorRequirementsForm from './InstructorRequirementsForm';
import CourseDiscussions from './CourseDiscussions';
import Navbar from '../Navbar';

const InstructorDashboard = () => {
  const instructorId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

  const [activeTab, setActiveTab] = useState('Courses'); // main tab
  const [activeTabs, setActiveTabs] = useState({}); // per-course tab
  const [courses, setCourses] = useState([]);
  const [courseContent, setCourseContent] = useState({});
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [contentType, setContentType] = useState('file');
  const [file, setFile] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [ratings, setRatings] = useState({});
  const [announcements, setAnnouncements] = useState({});


  const fetchRatings = async (courseId) => {
    const res = await fetch(`http://localhost:8000/api/course_ratings/${courseId}`);
    const data = await res.json();
    setRatings(prev => ({ ...prev, [courseId]: data }));
  };
  const fetchAnnouncements = async (courseId) => {
    const res = await fetch(`http://localhost:8000/api/announcements/${courseId}`);
    const data = await res.json();
    setAnnouncements(prev => ({ ...prev, [courseId]: data }));
  };

  const setTab = (courseId, tab) => {
    setActiveTabs(prev => ({ ...prev, [courseId]: tab }));
    
      if (tab === 'Ratings') {
        fetchRatings(courseId);
      }
      if (tab === 'Announcements') {
        fetchAnnouncements(courseId);
      }
    
  };

  const handleViewContent = async (courseId) => {
    const res = await fetch(`http://localhost:8000/api/courses/${courseId}/content`);
    const content = await res.json();
    setCourseContent(prev => ({ ...prev, [courseId]: content }));
    setActiveCourseId(courseId === activeCourseId ? null : courseId);
    
  };
  
  const handleAnnouncement = async (e, courseId) => {
    e.preventDefault();
    await fetch('http://localhost:8000/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId, instructor_id: instructorId, message })
    });
    alert('Posted!');
    setMessage('');
    // Refresh announcements
  const res = await fetch(`http://localhost:8000/api/announcements/${courseId}`);
  const data = await res.json();
  setAnnouncements(prev => ({ ...prev, [courseId]: data }));
  };

  const handleSubmit = async (e, courseIdParam) => {
    e.preventDefault();
    const targetCourseId = courseIdParam;
  
    if (!file || !targetCourseId || !contentType) {
      return alert("All fields required");
    }
  
    let res;
  
    if (contentType === 'file' || contentType === 'video') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', targetCourseId);
      formData.append('content_type', contentType);
  
      res = await fetch('http://localhost:8000/api/upload/file', {
        method: 'POST',
        body: formData
      });
  
    } else {
      // For 'text' and 'link'
      res = await fetch('http://localhost:8000/api/upload/text-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: targetCourseId,
          content_type: contentType,
          content_value: file  // file here contains text or link string
        })
      });
    }
  
    const data = await res.json();
    alert(data.message || data.error);
  };
  

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructor_id: instructorId,
        title: newTitle,
        description: newDesc,
        price: newPrice
      })
    });
    const data = await res.json();
    alert(data.message);
    setNewTitle('');
    setNewDesc('');
    setNewPrice(0);

    const updated = await fetch(`http://localhost:8000/api/instructors/${instructorId}/courses`);
    setCourses(await updated.json());
  };

  useEffect(() => {
    if (!instructorId) return;
    fetch(`http://localhost:8000/api/instructors/${instructorId}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data));
  }, [instructorId]);

  return (
    <div>
      <Navbar role="instructor"/>
      <div className="p-6 space-y-8">
      {/* Top-level tabs */}
      <div className="flex gap-3 mb-6 border-b pb-2">
        {['Courses', 'Create Course'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* === Courses Tab === */}
      {activeTab === 'Courses' && (
        <div>
          <h3 className="text-3xl font-bold text-center text-blue-800 mb-4 ">Your Courses</h3>
          {courses.map(course => {
            const tab = activeTabs[course.course_id];
            const isContentVisible = activeCourseId === course.course_id && courseContent[course.course_id];

            return (
              <div key={course.course_id} className="border p-4 mb-6 rounded shadow bg-orange-300">
                <h4 className="text-xl font-semibold">{course.title}</h4>
                <p className="text-gray-600 mb-2">{course.description}</p>

                {/* Per-Course Tabs */}
                <div className="flex mt-4 gap-2 mb-3 border-b pb-2 justify-center">
                {['Content', 'Upload', 'Exam', 'Requirements', 'Announcements', 'Ratings', 'Discussions'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(course.course_id, t)}
                      className={`px-3 py-1 rounded ${
                        tab === t ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-3 border rounded bg-[#90C67C]">
                  {tab === 'Content' && (
                    <>
                      <button
                        onClick={() => handleViewContent(course.course_id)}
                        className="mb-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        {isContentVisible ? "Hide" : "View"} Uploaded Content
                      </button>
                      {isContentVisible && (
                        <ul className="mt-2 list-disc ml-5 text-sm text-gray-800 text-left">
                        {courseContent[course.course_id]?.map((c, i) => (
                          <li key={i}>
                            {c.content_type.toUpperCase()} →{' '}
                            <a
                              href={c.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {c.content_url}
                            </a>
                          </li>
                        ))}
                      </ul>                      
                      )}
                    </>
                  )}

                  {tab === 'Upload' && (
                    <form onSubmit={(e) => handleSubmit(e, course.course_id)} className="space-y-4">
                    <label className="block font-medium">Content Type</label>
                    <select
                      value={contentType}
                      onChange={e => setContentType(e.target.value)}
                      className="border p-2 w-full"
                    >
                      <option value="file">File</option>
                      <option value="video">Video</option>
                      <option value="link">Link</option>
                      <option value="text">Text</option>
                    </select>
                  
                    {['file', 'video'].includes(contentType) && (
                      <>
                        <label className="block font-medium">Upload File</label>
                        <input
                          type="file"
                          onChange={e => setFile(e.target.files[0])}
                          className="w-full"
                          required
                        />
                      </>
                    )}
                  
                    {contentType === 'text' && (
                      <>
                        <label className="block font-medium">Enter Text Content</label>
                        <textarea
                          className="border p-2 w-full"
                          placeholder="Type your content here..."
                          onChange={e => setFile(e.target.value)}
                          required
                        />
                      </>
                    )}
                  
                    {contentType === 'link' && (
                      <>
                        <label className="block font-medium">Paste Link</label>
                        <input
                          type="url"
                          className="border p-2 w-full"
                          placeholder="https://example.com"
                          onChange={e => setFile(e.target.value)}
                          required
                        />
                      </>
                    )}
                  
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setTab(course.course_id, null)}
                        className="bg-gray-500 text-white px-3 py-2 rounded"
                      >
                        ← Back
                      </button>
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Upload
                      </button>
                    </div>
                  </form>                  
                  )}

                  {tab === 'Exam' && <InstructorExamCreator courseId={course.course_id} onBack={() => setTab(course.course_id, null)} />}
                  {tab === 'Requirements' && <InstructorRequirementsForm courseId={course.course_id} onBack={() => setTab(course.course_id, null)} />}
                  {tab === 'Announcements' && (
                    <div className="space-y-4">
                      {/* Existing Announcements */}
                      <div className="space-y-2">
                        {announcements[course.course_id]?.map((a, i) => (
                          <div key={i} className="bg-gray-100 p-3 rounded shadow-sm">
                            <p className="text-md font-bold">{a.message}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Posted on {new Date(a.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Post New Announcement */}
                      <form onSubmit={e => handleAnnouncement(e, course.course_id)} className="space-y-2">
                        <textarea
                          placeholder="Write your message..."
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          className="border p-2 w-full"
                        />
                        <button className="bg-blue-600 text-white px-4 py-1 rounded">Post</button>
                      </form>
                    </div>
                  )}

                  {tab === 'Ratings' && (
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Student Ratings</h4>
                      {ratings[course.course_id]?.length > 0 ? (
                        <ul className="space-y-3">
                          {ratings[course.course_id].map((r, i) => (
                            <li key={i} className="bg-white border p-3 rounded shadow">
                              <div className="font-semibold">⭐ {r.rating}/5</div>
                              <p className="text-sm mt-1 italic">"{r.review}"</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Submitted on {new Date(r.created_at).toLocaleDateString()}
                              </p>
                            </li>
                          ))}
                          
                        </ul>
                      ) : (
                        <p className="text-sm italic text-gray-500">No ratings yet for this course.</p>
                      )}
                    </div>
                  )}
                  {tab === 'Discussions' && (
                    <CourseDiscussions
                      courseId={course.course_id}
                      userId={JSON.parse(sessionStorage.getItem("user"))?.user_id}
                      role={"instructor"}
                    />
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === Create Course Tab === */}
      {activeTab === 'Create Course' && (
  <div className="flex justify-center ">
    <form onSubmit={handleCreateCourse} className="p-6 border rounded shadow w-full bg-blue-400 text-center max-w-xl">
      <h3 className="text-lg font-semibold mb-4">Create New Course</h3>

      <label className="block mb-1 font-medium text-left">Course Title</label>
      <input
        type="text"
        placeholder="Title"
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
        className="border p-2 w-full mb-4"
        required
      />

      <label className="block mb-1 font-medium  text-left">Course Description</label>
      <textarea
        placeholder="Description"
        value={newDesc}
        onChange={e => setNewDesc(e.target.value)}
        className="border p-2 w-full mb-4"
        required
      />

      <label className="block mb-1 font-medium  text-left">Price (₹)</label>
      <input
        type="number"
        placeholder="Price"
        value={newPrice}
        onChange={e => setNewPrice(e.target.value)}
        className="border p-2 w-full mb-4"
        required
      />

      <button type="submit" className="bg-green-400 font-bold px-6 py-2 rounded hover:bg-green-600">
        Create
      </button>
    </form>
  </div>
)}
      </div>
    </div>
  );
};

export default InstructorDashboard;
