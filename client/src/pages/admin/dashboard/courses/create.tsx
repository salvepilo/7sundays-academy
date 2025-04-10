import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const AdminCreateCourse = () => {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [formData, setFormData] = useState({ title: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, router, user]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ title: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/courses',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessMessage('Corso creato con successo!');
      // Redirect to courses list after 2 seconds
      setTimeout(() => {
        router.push('/admin/dashboard/courses');
      }, 2000);
    } catch (err: any) {
      console.error('Errore nella creazione del corso:', err);
      setError(err.response?.data?.message || 'Si è verificato un errore durante la creazione del corso');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Crea Corso</title>
      </Head>
      <AdminLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Crea un nuovo Corso</h1>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p>{successMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="courseName" className="block text-gray-700 text-sm font-bold mb-2">
                Nome del Corso
              </label>
              <input type="text" id="courseName" name="title" value={formData.title} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Inserisci il nome del corso" required />
            </div>
            <button type="submit" disabled={isSubmitting} className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSubmitting ? 'Creazione in corso...' : 'Crea Corso'}</button>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminCreateCourse;

