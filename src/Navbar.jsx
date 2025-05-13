import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ role = "student" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-900 text-white px-6 py-6 flex items-center justify-between shadow">
      <div className="text-lg font-semibold cursor-pointer" onClick={() => {
        navigate(role === "student" ? "/student-dashboard" : "/instructor-dashboard");
      }}>
        {role === "student" ? "Student Dashboard" : "Instructor Dashboard"}
      </div>

      <button
        onClick={handleLogout}
        className="bg-pink-600 hover:bg-red-700 px-4 py-1 rounded text-md font-bold"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
