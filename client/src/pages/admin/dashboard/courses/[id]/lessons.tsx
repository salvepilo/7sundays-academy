import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';

// Tipi
interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
}

export default function ManageLessons() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Stato per il form di aggiunta/modifica lezione
  const [showForm, setShowForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    order: 0,
  });

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

  // Carica i dati del corso e delle lezioni quando l'ID è disponibile
  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      if (!id || !isAuthenticated || user?.role !== 'admin') return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5001/api/courses/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const courseData = response.data.data.course;
        setCourse(courseData);
        setLessons(courseData.lessons || []);
      } catch (err: any) {
        console.error('Errore nel caricamento del corso e delle lezioni:', err);
        setError(err.response?.data?.message || 'Si è verificato un errore durante il caricamento dei dati');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndLessons();
  }, [id, isAuthenticated, user]);

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }));
  };

  // Apre il form per aggiungere una nuova lezione
  const handleAddLesson = () => {
    setEditingLessonId(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      order: lessons.length + 1,
    });
    setShowForm(true);
  };

  // Apre il form per modificare una lezione esistente
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson._id);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
    });
    setShowForm(true);
  };

  // Chiude il form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLessonId(null);
  };

  // Gestisce l'invio del form per aggiungere/modificare una lezione
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (editingLessonId) {
        // Aggiorna una lezione esistente
        response = await axios.patch(
          `http://localhost:5001/api/courses/${id}/lessons/${editingLessonId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setSuccessMessage('Lezione aggiornata con successo!');
        
        // Aggiorna la lezione nella lista
        setLessons(prevLessons => 
          prevLessons.map(lesson => 
            lesson._id === editingLessonId ? { ...lesson, ...formData } : lesson
          )
        );
      } else {
        // Crea una nuova lezione
        response = await axios.post(
          `http://localhost:5001/api/courses/${id}/lessons`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setSuccessMessage('Lezione aggiunta con successo!');
        
        // Aggiungi la nuova lezione alla lista
        const newLesson = response.data.data.lesson;
        setLessons(prevLessons => [...prevLessons, newLesson]);
      }
      
      // Chiudi il form dopo il successo
      setShowForm(false);
      setEditingLessonId(null);
    } catch (err: any) {
      console.error('Errore nella gestione della lezione:', err);
      setError(err.response?.data?.message || 'Si è verificato un errore durante il salvataggio della lezione');
    }
  };

  // Gestisce l'eliminazione di una lezione
  const handleDeleteLesson = async (lessonId: string) => {
    if (!id || !confirm('Sei sicuro di voler eliminare questa lezione? Questa azione non può essere annullata.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5001/api/courses/${id}/lessons/${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccessMessage('Lezione eliminata con successo!');
      
      // Rimuovi la lezione dalla lista
      setLessons(prevLessons => prevLessons.filter(lesson => lesson._id !== lessonId));
    } catch (err: any) {
      console.error('Errore nell\'eliminazione della lezione:', err);
      setError(err.response?.data?.message || 'Si è verificato un errore durante l\'eliminazione della lezione');
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
        <title>Gestione Lezioni | Admin 7Sundays Academy</title>
        <meta name="description" content="Gestione delle lezioni per un corso sulla piattaforma 7Sundays Academy" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestione Lezioni</h1>
            <p className="text-gray-600 mt-2">
              Corso: {course?.title || 'Caricamento...'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin/dashboard/courses')}
              className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Torna ai Corsi
            </button>
            <button
              onClick={handleAddLesson}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Aggiungi Lezione
            </button>
          </div>
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

        {/* Form per aggiungere/modificare lezione */}
        {showForm && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingLessonId ? 'Modifica Lezione' : 'Aggiungi Nuova Lezione'}
            </h2>
            <form onSubmit={handleSubmitForm}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                  Titolo *
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

              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                  Descrizione *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="videoUrl" className="block text-gray-700 text-sm font-bold mb-2">
                  URL Video *
                </label>
                <input
                  type="text"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="duration" className="block text-gray-700 text-sm font-bold mb-2">
                    Durata (es. "15m") *
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

                <div>
                  <label htmlFor="order" className="block text-gray-700 text-sm font-bold mb-2">
                    Ordine *
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {editingLessonId ? 'Aggiorna Lezione' : 'Aggiungi Lezione'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista delle lezioni */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordine
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titolo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durata
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessons.length > 0 ? (
                lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <tr key={lesson._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lesson.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-md">{lesson.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lesson.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Elimina
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nessuna lezione trovata. Aggiungi la prima lezione per questo corso.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}