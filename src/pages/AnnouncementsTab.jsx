import React, { useEffect, useState } from 'react';

const AnnouncementsTab = ({ courseId, onBack }) => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/announcements/${courseId}`)
      .then(res => res.json())
      .then(setAnnouncements);
  }, [courseId]);

  return (
    <div>
      <button onClick={onBack} className="mb-4 bg-gray-500 text-white px-4 py-2 rounded">
        ← Back
      </button>
      <h3 className="text-lg font-semibold mb-3">📢 Announcements</h3>
      {announcements.length > 0 ? (
        <ul className="space-y-3">
          {announcements.map((a, i) => (
            <li key={i} className="p-3 border bg-white rounded shadow">
              <p className='text-md'> <b>{a.message} </b></p>
              <p className="text-sm text-gray-500 mt-1">
                Posted on {new Date(a.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No announcements yet.</p>
      )}
    </div>
  );
};

export default AnnouncementsTab;
