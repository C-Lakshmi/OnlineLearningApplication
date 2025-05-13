import { useParams } from 'react-router-dom';
import StudentExam from './StudentExam';

const StudentExamWrapper = () => {
  const { courseId } = useParams();
  return <StudentExam courseId={courseId} />;
};

export default StudentExamWrapper;
