import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';

// Tipi
interface CourseFormData {
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  duration: string;
  isPublished: boolean;
}

export default function CreateCourse() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    duration: '',
    isPublished: false,
  });
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

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gestisce l'invio del form
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
      
      // Reindirizza alla lista dei corsi dopo 2 secondi
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
    <AdminLayout>
      <Head>
        <title>Crea Nuovo Corso | Admin 7Sundays Academy</title>
        <meta name="description" content="Crea un nuovo corso per la piattaforma 7Sundays Academy" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Crea Nuovo Corso</h1>
          <p className="text-gray-600 mt-2">Compila il form per creare un nuovo corso sulla piattaforma</p>
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
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Descrizione *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="thumbnail" className="block text-gray-700 text-sm font-bold mb-2">
              URL Immagine di Copertina
            </label>
            <input
              type="text"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              Categoria *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Seleziona una categoria</option>
              <option value="Marketing">Marketing</option>
              <option value="Social Media">Social Media</option>
              <option value="SEO">SEO</option>
              <option value="Analytics">Analytics</option>
              <option value="Content Creation">Content Creation</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="duration" className="block text-gray-700 text-sm font-bold mb-2">
              Durata (es. "4h 30m") *
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm font-bold">Pubblica immediatamente</span>
            </label>
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
              {isSubmitting ? 'Creazione in corso...' : 'Crea Corso'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}