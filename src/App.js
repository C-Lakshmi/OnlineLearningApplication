import './App.css';
import "@fontsource/montserrat";
import "@fontsource/lato";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from "./pages/StudentDashboard"

import InstructorDashboard from './pages/InstructorDashboard';
import StudentExamWrapper from './pages/StudentExamWrapper';
import StudentExamSummary from './pages/StudentExamSummary';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
        <Route path="/exam/:courseId" element={<StudentExamWrapper />} />
        <Route path="/exam/:examId/summary" element={<StudentExamSummary />} />
      </Routes>
    </Router>
  );
}