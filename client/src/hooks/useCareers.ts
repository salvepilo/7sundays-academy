tsx
import { useState, useEffect } from 'react';

interface Career {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  salary: string;
  contactEmail: string;
  postedAt: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

const useCareers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/careers');
        if (!response.ok) {
          throw new Error('Failed to fetch careers');
        }
        const data = await response.json();
        setCareers(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCareers();
  }, []);

  const createCareer = async (careerData: Omit<Career, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careerData),
      });
      if (!response.ok) {
        throw new Error('Failed to create career');
      }
      const newCareer = await response.json();
      setCareers([...careers, newCareer]);
      return newCareer;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    }
  };

  const updateCareer = async (id: string, careerData: Partial<Career>) => {
    try {
      const response = await fetch(`/api/careers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careerData),
      });
      if (!response.ok) {
        throw new Error('Failed to update career');
      }
      const updatedCareer = await response.json();
      setCareers(careers.map(career => (career._id === id ? updatedCareer : career)));
      return updatedCareer;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    }
  };

  const deleteCareer = async (id: string) => {
    try {
      const response = await fetch(`/api/careers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete career');
      }
      setCareers(careers.filter(career => career._id !== id));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return { careers, isLoading, error, createCareer, updateCareer, deleteCareer };
};

export default useCareers;