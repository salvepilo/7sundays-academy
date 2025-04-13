import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Errore nel caricamento degli utenti');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'instructor' | 'student';
    avatar?: string;
    bio?: string;
  }) => {
    try {
      const response = await axios.post('/api/users', userData);
      setUsers((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const response = await axios.put(`/api/users/${id}`, userData);
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? response.data : user))
      );
      return response.data;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};