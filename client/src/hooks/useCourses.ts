import { useState, useEffect } from 'react';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  thumbnail: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  enrollments: Array<{
    _id: string;
    student: {
      _id: string;
      name: string;
      email: string;
    };
    progress: number;
    completed: boolean;
  }>;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Errore nel caricamento dei corsi');
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: Partial<Course>) => {
    try {
      const response = await axios.post('/api/courses', courseData);
      setCourses((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating course:', err);
      throw err;
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      const response = await axios.put(`/api/courses/${id}`, courseData);
      setCourses((prev) =>
        prev.map((course) => (course._id === id ? response.data : course))
      );
      return response.data;
    } catch (err) {
      console.error('Error updating course:', err);
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await axios.delete(`/api/courses/${id}`);
      setCourses((prev) => prev.filter((course) => course._id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refetch: fetchCourses,
  };
};