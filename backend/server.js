const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/users'));
const studentRoutes = require('./routes/students');
app.use('/api/students', studentRoutes);
const courseRoutes = require('./routes/courses');
app.use('/api/courses', courseRoutes);

const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('uploads'));

const enrollmentRoutes = require('./routes/enrollments');
app.use('/api/enroll', enrollmentRoutes);

const instructorRoutes = require('./routes/instructors');
app.use('/api/instructors', instructorRoutes);

const examRoutes = require('./routes/exams');
app.use('/api/exams', examRoutes);

const viewRoutes = require('./routes/views');
app.use('/api/views', viewRoutes);

const certificateRoutes = require('./routes/certificates');
app.use('/api/certificates', certificateRoutes);

const courseRequirementRoutes = require('./routes/courseRequirements');
app.use('/api/course-requirements', courseRequirementRoutes);

const resRoutes = require('./routes/results');
app.use('/api/results', resRoutes);

const annRoutes = require('./routes/announcements');
app.use('/api/announcements', annRoutes);

const ratingRoutes = require('./routes/ratings');
app.use('/api/course_ratings', ratingRoutes);

const discRoutes = require('./routes/discussions');
app.use('/api/discussions', discRoutes);

app.listen(8000, () => console.log('Server running on http://localhost:8000'));
