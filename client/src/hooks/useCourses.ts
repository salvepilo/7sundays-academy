import { useState, useEffect } from 'react';

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
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
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
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) {
        throw new Error('Failed to create course');
      }
      const data = await response.json();
      setCourses([...courses, data]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (courseId: string, courseData: Partial<Omit<Course, '_id' | 'createdAt' | 'updatedAt'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) {
        throw new Error('Failed to update course');
      }
      const data = await response.json();
      setCourses(courses.map((course) => (course._id === courseId ? data : course)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      setCourses(courses.filter((course) => course._id !== courseId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { courses, isLoading, error, createCourse, updateCourse, deleteCourse };
};

export default useCourses;