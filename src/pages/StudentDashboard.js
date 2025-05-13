import React, { useEffect, useState } from 'react';
import StudentExam from './StudentExam';
import StudentExamSummary from './StudentExamSummary';
import jsPDF from 'jspdf';
import StudentResultSummary from './StudentResultSummary';
import AnnouncementsTab from './AnnouncementsTab';
import CourseRatingForm from './CourseRatingForm';
import CourseDiscussions from './CourseDiscussions';
import Navbar from '../Navbar';

const StudentDashboard = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseContent, setCourseContent] = useState({});
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [activeTabs, setActiveTabs] = useState({});

  const studentId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

  const setTab = (courseId, tab) => {
    setActiveTabs(prev => ({ ...prev, [courseId]: tab }));
  };

  const downloadPDF = (courseTitle) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Certificate of Completion", 60, 40);
    doc.setFontSize(14);
    doc.text(`Student ID: ${studentId}`, 20, 60);
    doc.text(`has successfully completed the course: "${courseTitle}"`, 20, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
    doc.save(`${courseTitle}-certificate.pdf`);
  };

  useEffect(() => {
    if (!studentId) return;

    fetch('http://localhost:8000/api/courses')
      .then(res => res.json())
      .then(setAllCourses);

    fetch(`http://localhost:8000/api/students/${studentId}/enrollments`)
      .then(res => res.json())
      .then(async (data) => {
        setEnrolledCourses(data);
        for (const course of data) {
          const res = await fetch('http://localhost:8000/api/certificates/check-and-issue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, course_id: course.course_id })
          });
          const result = await res.json();
          if (result.eligible) {
            console.log(`🎓 Certificate issued for ${course.title}`);
          }
        }
      });
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    fetch(`http://localhost:8000/api/certificates/${studentId}`)
      .then(res => res.json())
      .then(setCertificates);
  }, [studentId]);

  const enrolledIds = new Set(enrolledCourses.map(c => c.course_id));

  const handleViewContent = async (courseId) => {
    const res = await fetch(`http://localhost:8000/api/courses/${courseId}/content`);
    const content = await res.json();
    setCourseContent(prev => ({ ...prev, [courseId]: content }));
    setActiveCourseId(prev => (prev === courseId ? null : courseId));
  };

  const handleEnroll = async (courseId) => {
    const res = await fetch('http://localhost:8000/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, course_id: courseId })
    });

    const data = await res.json();
    alert(data.message || data.error);

    const refresh = await fetch(`http://localhost:8000/api/students/${studentId}/enrollments`);
    const updated = await refresh.json();
    setEnrolledCourses(updated);
  };

  const recordView = async (courseId, contentUrl) => {
    const studentId = JSON.parse(sessionStorage.getItem("user"))?.user_id;
    if (!studentId) return;
  
    try {
      await fetch('http://localhost:8000/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          course_id: courseId,
          content_url: contentUrl
        })
      });
    } catch (error) {
      console.error("Failed to record view:", error);
    }
  };
  
  return (
<div>
  <Navbar/>
  <div className="p-6"> 
  {/* Enrolled Courses Section */}
  <h2 className="text-3xl font-bold text-center text-blue-800 mt-4 mb-4">Your Enrolled Courses</h2>

  {allCourses.filter(c => enrolledIds.has(c.course_id)).map(course => {
    const isEnrolled = enrolledIds.has(course.course_id);
    const cert = certificates.find(c => c.course_id === course.course_id);
    const isContentVisible = activeCourseId === course.course_id && courseContent[course.course_id];

    return (
      <div key={course.course_id} className="border bg-orange-300 p-6 mb-6 rounded-lg shadow-md bg-white space-y-4">
        <div className="text-center">
        <div className="relative text-center">
  {/* Centered Course Info */}
  <div>
    <h3 className="text-2xl font-semibold">{course.title}</h3>
    <p className="text-gray-600">{course.description}</p>
  </div>

  {/* Absolutely positioned certificate on right */}
  {cert && (
    <div className="absolute top-0 right-0 bg-blue-100 border border-blue-300 px-4 py-2 rounded text-blue-800 font-semibold">
      🎓 Certificate Issued!
    </div>
  )}
</div>
          {isEnrolled && <p className="text-green-600 font-medium mt-1">Status: Enrolled</p>}
        </div>


        <div className="flex justify-center gap-3 mt-3 border-b pb-2">
          {['Content', 'Exam', 'Result Summary', 'Certificate', 'Announcements', 'Rate the Course', 'Discussions'].map(tab => (
            <button
              key={tab}
              onClick={() => setTab(course.course_id, tab)}
              className={`px-4 py-1 rounded-t ${
                activeTabs[course.course_id] === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="border border-t-0 p-4 rounded-b bg-[#90C67C]">
          {/* === CONTENT TAB === */}
          {activeTabs[course.course_id] === 'Content' && (
            <>
              <button
                onClick={() => handleViewContent(course.course_id)}
                className="mb-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {isContentVisible ? "Hide Content" : "Show Content"}
              </button>

              {isContentVisible && (
                <div className="space-y-4">
                  {(() => {
                    let videoCount = 0, fileCount = 0, textCount = 0, linkCount = 0;
                    const sortedContent = [...(courseContent[course.course_id] || [])].sort((a, b) => {
                      const getPriority = (item) => {
                        const isYouTube = item.content_type === 'link' && item.content_url.includes('youtube.com/watch');
                        if (item.content_type === 'video' || isYouTube) return 1;
                        if (item.content_type === 'file') return 2;
                        if (item.content_type === 'link') return 3;
                        if (item.content_type === 'text') return 4;
                        return 5;
                      };
                      return getPriority(a) - getPriority(b);
                    });

                    return sortedContent.map((item, idx) => {
                      const isYouTube = item.content_type === 'link' && item.content_url.includes('youtube.com/watch');
                      const embedId = isYouTube ? new URL(item.content_url).searchParams.get('v') : null;

                      let label = '';
                      if (item.content_type === 'video' || isYouTube) {
                        label = `Lecture ${++videoCount}:`;
                      } else if (item.content_type === 'file') {
                        label = `File ${++fileCount}:`;
                      } else if (item.content_type === 'link') {
                        label = `Link ${++linkCount}:`;
                      } else if (item.content_type === 'text') {
                        label = `Note ${++textCount}:`;
                      }

                      return (
                        <div key={idx} className="bg-gray-100 p-3 rounded">
                          <strong>{label}</strong>
                          {item.content_type === 'video' ? (
                            <div className="flex justify-center mt-2">
                            <video
                              controls
                              className="mt-2 w-[60%] justify-center"
                              onPlay={() => recordView(course.course_id, item.content_url)}
                            >
                              <source src={item.content_url} type="video/mp4" />
                            </video>
                            </div>
                          ) : item.content_type === 'text' ? (
                            <p
                              className="mt-2 cursor-pointer "
                              onClick={() => recordView(course.course_id, item.content_url)}
                            >
                              {item.content_url}
                            </p>
                          ) : isYouTube && embedId ? (
                            <div className="flex justify-center mt-2">
                            <iframe
                              className="mt-2 w-[60%] aspect-video rounded justify-center"
                              src={`https://www.youtube.com/embed/${embedId}`}
                              title="YouTube video"
                              allowFullScreen
                              onLoad={() => recordView(course.course_id, item.content_url)}
                            ></iframe>
                            </div>
                          ) : item.content_type === 'link' ? (
                            <a
                              href={item.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline mt-2 block"
                              onClick={() => recordView(course.course_id, item.content_url)}
                            >
                              View Link
                            </a>
                          ) : (
                            <a
                              href={item.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline mt-2 block"
                              onClick={() => recordView(course.course_id, item.content_url)}
                            >
                              View File
                            </a>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </>
          )}

          {/* === EXAM TAB === */}
          {activeTabs[course.course_id] === 'Exam' && (
            <StudentExam
              courseId={course.course_id}
              onBack={() => setTab(course.course_id, null)}
            />
          )}

          {/* === RESULT SUMMARY TAB === */}
          {activeTabs[course.course_id] === 'Result Summary' && (
            <StudentResultSummary
              courseId={course.course_id}
              onBack={() => setTab(course.course_id, null)}
            />
          )}

          {/* === CERTIFICATE TAB === */}
          {activeTabs[course.course_id] === 'Certificate' &&
            (cert ? (
              <div className="text-center">
                <h4 className="text-lg font-bold text-blue-800">🎓 Certificate of Completion</h4>
                <p className="text-sm mt-1">Issued on: {new Date(cert.issued_at).toLocaleDateString()}</p>
                <button onClick={() => downloadPDF(course.title)} className="mt-2 bg-blue-700 text-white px-4 py-2 rounded">
                  Download PDF
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Certificate not yet issued.</p>
            ))}

          {/* === ANNOUNCEMENTS === */}
          {activeTabs[course.course_id] === 'Announcements' && (
            <AnnouncementsTab
              courseId={course.course_id}
              onBack={() => setTab(course.course_id, null)}
            />
          )}

          {/* === RATINGS === */}
          {activeTabs[course.course_id] === 'Rate the Course' && (
            <CourseRatingForm
              courseId={course.course_id}
              onBack={() => setTab(course.course_id, null)}
            />
          )}

          {/* === DISCUSSIONS === */}
          {activeTabs[course.course_id] === 'Discussions' && (
            <CourseDiscussions
              courseId={course.course_id}
              userId={JSON.parse(sessionStorage.getItem("user"))?.user_id}
              role="student"
            />
          )}
        </div>
      </div>
    );
  })}

  {/* Suggested Courses Section */}
  <h2 className="text-3xl font-bold text-center mt-10 mb-4 text-blue-800 ">Suggested for You</h2>

  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {allCourses.filter(c => !enrolledIds.has(c.course_id)).map(course => (
      <div key={course.course_id} className="border border-gray-300 p-4 rounded-lg bg-yellow-300 shadow-sm hover:shadow-md transition">
        <h3 className="text-xl font-semibold text-gray-800">{course.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
        <button
          onClick={() => handleEnroll(course.course_id)}
          className="mt-4 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
          Enroll
        </button>
      </div>
    ))}
  </div>
  </div>
</div>
);
};

export default StudentDashboard;


