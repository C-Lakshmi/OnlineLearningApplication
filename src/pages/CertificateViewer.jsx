import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

const CertificateViewer = () => {
  const [certificates, setCertificates] = useState([]);
  const studentId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

  useEffect(() => {
    fetch(`http://localhost:8000/api/certificates/${studentId}`)
      .then(res => res.json())
      .then(setCertificates);
  }, [studentId]);

  const downloadPDF = (course) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Certificate of Completion", 60, 40);
    doc.setFontSize(14);
    doc.text(`This is to certify that Student ID ${studentId}`, 20, 60);
    doc.text(`has successfully completed the course: "${course.title}"`, 20, 70);
    doc.text(`Date: ${new Date(course.issued_at).toLocaleDateString()}`, 20, 80);
    doc.save(`${course.title}-certificate.pdf`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Certificates</h2>
      {certificates.length === 0 && <p>No certificates issued yet.</p>}
      {certificates.map(course => (
        <div key={course.course_id} className="border p-4 mb-3 rounded">
          <p><strong>Course:</strong> {course.title}</p>
          <p><strong>Issued on:</strong> {new Date(course.issued_at).toLocaleDateString()}</p>
          <button
            onClick={() => downloadPDF(course)}
            className="bg-green-600 text-white px-3 py-1 rounded mt-2"
          >
            Download PDF
          </button>
        </div>
      ))}
    </div>
  );
};

export default CertificateViewer;
