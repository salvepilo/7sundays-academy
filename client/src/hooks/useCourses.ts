import { useState, useEffect } from 'react';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get('/api/courses', { headers });
        setCourses(response.data.data.courses);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const createCourse = async (courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post('/api/courses', courseData, { headers });
      setCourses([...courses, response.data.data.course]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (courseId: string, courseData: Partial<Omit<Course, '_id' | 'createdAt' | 'updatedAt'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`/api/courses/${courseId}`, courseData, { headers });
      setCourses(courses.map((course) => (course._id === courseId ? response.data.data.course : course)));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/courses/${courseId}`, { headers });
      setCourses(courses.filter((course) => course._id !== courseId));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { courses, isLoading, error, createCourse, updateCourse, deleteCourse };
};

export default useCourses;