import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';

// Tipi

interface CourseData {
    name: string;
}

export default function EditCourse() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reindirizza alla pagina di login se l'utente non è autenticato o non è admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, router, user]);

  // Carica i dati del corso quando l'ID è disponibile
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id ) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get<{data: {course:CourseData}}>(
          `http://localhost:5001/api/courses/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const courseData = response.data.data.course;
        setFormData({name: courseData.name || ''
        });
      } catch (err: any) {
        console.error('Errore nel caricamento del corso:', err);
        setError(err.response?.data?.message || 'Si è verificato un errore durante il caricamento del corso');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id, isAuthenticated, user]);


  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev,[name]: value}))
  };
  


  // Gestisce l'invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!id) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token')
      const response = await axios.patch(
        `http://localhost:5001/api/courses/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );


      setSuccessMessage('Corso aggiornato con successo!');
      
      // Reindirizza alla lista dei corsi dopo 2 secondi
      setTimeout(() => {
        router.push('/admin/dashboard/courses');
      }, 2000);
    } catch (err: any) {
      console.error('Errore nell\'aggiornamento del corso:', err);
      setError(err.response?.data?.message || 'Si è verificato un errore durante l\'aggiornamento del corso');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Modifica Corso | Admin 7Sundays Academy</title>
        <meta name="description" content="Modifica un corso esistente sulla piattaforma 7Sundays Academy" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Modifica Corso</h1>
          <p className="text-gray-600 mt-2">Aggiorna le informazioni del corso</p>
        </div>

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

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Titolo del Corso *
          </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            />
        </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard/courses')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Aggiornamento in corso...' : 'Aggiorna Corso'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

