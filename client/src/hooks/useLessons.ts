tsx
import { useState, useEffect } from 'react';

interface Lesson {
  _id: string;
  course: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  video: string;
}

interface UseLessonsResult {
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;
  createLesson: (lessonData: Partial<Lesson>) => Promise<Lesson | null>;
  updateLesson: (lessonId: string, lessonData: Partial<Lesson>) => Promise<Lesson | null>;
  deleteLesson: (lessonId: string) => Promise<boolean>;
}

const useLessons = (): UseLessonsResult => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/lessons');
        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }
        const data = await response.json();
        setLessons(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const createLesson = async (lessonData: Partial<Lesson>): Promise<Lesson | null> => {
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      const newLesson: Lesson = await response.json();
      setLessons([...lessons, newLesson]);
      return newLesson;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const updateLesson = async (lessonId: string, lessonData: Partial<Lesson>): Promise<Lesson | null> => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }

      const updatedLesson: Lesson = await response.json();
      setLessons(lessons.map(lesson => (lesson._id === lessonId ? updatedLesson : lesson)));
      return updatedLesson;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const deleteLesson = async (lessonId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      setLessons(lessons.filter(lesson => lesson._id !== lessonId));
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  return { lessons, isLoading, error, createLesson, updateLesson, deleteLesson };
};

export default useLessons;