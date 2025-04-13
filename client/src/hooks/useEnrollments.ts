import { useState, useEffect } from 'react';
import axios from 'axios';

interface Enrollment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  progress: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('/api/enrollments');
      setEnrollments(response.data);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Errore nel caricamento delle iscrizioni');
    } finally {
      setLoading(false);
    }
  };

  const createEnrollment = async (enrollmentData: {
    studentId: string;
    courseId: string;
  }) => {
    try {
      const response = await axios.post('/api/enrollments', enrollmentData);
      setEnrollments((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating enrollment:', err);
      throw err;
    }
  };

  const updateEnrollment = async (id: string, enrollmentData: Partial<Enrollment>) => {
    try {
      const response = await axios.put(`/api/enrollments/${id}`, enrollmentData);
      setEnrollments((prev) =>
        prev.map((enrollment) => (enrollment._id === id ? response.data : enrollment))
      );
      return response.data;
    } catch (err) {
      console.error('Error updating enrollment:', err);
      throw err;
    }
  };

  const deleteEnrollment = async (id: string) => {
    try {
      await axios.delete(`/api/enrollments/${id}`);
      setEnrollments((prev) => prev.filter((enrollment) => enrollment._id !== id));
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return {
    enrollments,
    loading,
    error,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    refetch: fetchEnrollments,
  };
}; 