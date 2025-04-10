import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';

// Tipi
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  category: string;
}

export default function AdminCourses() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  // Carica i corsi
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // In una implementazione reale, questi dati verrebbero dal backend
        // Qui utilizziamo dati di esempio
        const mockCourses: Course[] = [
          {
            id: '1',
            title: 'Introduzione al Marketing Digitale',
            description: 'Impara le basi del marketing digitale e come applicarle al tuo business.',
            thumbnail: '/images/courses/digital-marketing.jpg',
            instructor: 'Marco Rossi',
            duration: '4h 30m',
            lessonsCount: 12,
            studentsCount: 156,
            createdAt: '2023-07-15T10:30:00Z',
            updatedAt: '2023-08-10T14:45:00Z',
            status: 'published',
            category: 'Marketing',
          },
          {
            id: '2',
            title: 'SEO Avanzato',
            description: 'Tecniche avanzate di ottimizzazione per i motori di ricerca per aumentare la visibilità del tuo sito.',
            thumbnail: '/images/courses/seo-advanced.jpg',
            instructor: 'Laura Bianchi',
            duration: '6h 15m',
            lessonsCount: 18,
            studentsCount: 89,
            createdAt: '2023-07-20T09:15:00Z',
            updatedAt: '2023-08-12T11:30:00Z',
            status: 'published',
            category: 'Marketing',
          },
          {
            id: '3',
            title: 'Social Media Strategy',
            description: 'Sviluppa una strategia efficace per i social media e aumenta l\'engagement del tuo pubblico.',
            thumbnail: '/images/courses/social-media.jpg',
            instructor: 'Alessandro Verdi',
            duration: '5h 45m',
            lessonsCount: 15,
            studentsCount: 124,
            createdAt: '2023-08-01T13:45:00Z',
            updatedAt: '2023-08-15T16:20:00Z',
            status: 'published',
            category: 'Social Media',
          },
          {
            id: '4',
            title: 'Email Marketing Efficace',
            description: 'Impara a creare campagne email che convertono e a costruire una lista di contatti di qualità.',
            thumbnail: '/images/courses/email-marketing.jpg',
            instructor: 'Giulia Neri',
            duration: '3h 30m',
            lessonsCount: 10,
            studentsCount: 78,
            createdAt: '2023-08-05T11:00:00Z',
            updatedAt: '2023-08-18T09:30:00Z',
            status: 'published',
            category: 'Marketing',
          },
          {
            id: '5',
            title: 'Analytics per il Marketing',
            description: 'Analizza i dati per prendere decisioni di marketing basate sui risultati e migliorare le performance.',
            thumbnail: '/images/courses/analytics.jpg',
            instructor: 'Roberto Marini',
            duration: '4h 15m',
            lessonsCount: 14,
            studentsCount: 0,
            createdAt: '2023-08-20T10:15:00Z',
            updatedAt: '2023-08-20T10:15:00Z',
            status: 'draft',
            category: 'Analytics',
          },
        ];

        setCourses(mockCourses);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei corsi:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchCourses();
    }
  }, [isAuthenticated, user]);

  // Filtra i corsi in base ai criteri di ricerca
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Estrai le categorie uniche per il filtro
  const categories = ['all', ...new Set(courses.map(course => course.category))];

  // Naviga alla pagina di creazione di un nuovo corso
  const handleCreateCourse = () => {
    router.push('/admin/dashboard/courses/create');
  };

  // Naviga alla pagina di modifica di un corso esistente
  const handleEditCourse = (courseId: string) => {
    router.push(`/admin/dashboard/courses/${courseId}/edit`);
  };

  // Naviga alla pagina di gestione delle lezioni di un corso
  const handleManageLessons = (courseId: string) => {
    router.push(`/admin/dashboard/courses/${courseId}/lessons`);
  };

  // Cambia lo stato di un corso (pubblicato/bozza)
  const handleToggleStatus = (courseId: string, currentStatus: string) => {
    // In una implementazione reale, questa operazione verrebbe eseguita tramite API
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId ? { ...course, status: newStatus as 'draft' | 'published' } : course
      )
    );
  };

  // Elimina un corso
  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo corso? Questa azione non può essere annullata.')) {
      // In una implementazione reale, questa operazione verrebbe eseguita tramite API
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestione Corsi | Admin 7Sundays Academy</title>
        <meta name="description" content="Gestione dei corsi per la piattaforma 7Sundays Academy" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestione Corsi</h1>
          <button
            onClick={handleCreateCourse}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Crea Nuovo Corso
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            <h2 className="text-xl font-semibold">Filtri</h2>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cerca corsi..."
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                <option value="published">Pubblicati</option>
                <option value="draft">Bozze</option>
              </select>
              <select
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Tutte le categorie' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {course.status === 'published' ? 'Pubblicato' : 'Bozza'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{course.description.length > 100 ? `${course.description.substring(0, 100)}...` : course.description}</p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <div>Istruttore: {course.instructor}</div>
                      <div>{course.duration}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-blue-50 p-2 rounded-md text-center">
                        <div className="text-sm text-gray-500">Lezioni</div>
                        <div className="font-semibold">{course.lessonsCount}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded-md text-center">
                        <div className="text-sm text-gray-500">Studenti</div>
                        <div className="font-semibold">{course.studentsCount}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between space-x-2">
                      <button
                        onClick={() => handleEditCourse(course.id)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-300 text-sm flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Modifica
                      </button>
                      <button
                        onClick={() => handleManageLessons(course.id)}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md transition duration-300 text-sm flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        Lezioni
                      </button>
                    </div>
                    
                    <div className="flex justify-between mt-2 space-x-2">
                      <button
                        onClick={() => handleToggleStatus(course.id, course.status)}
                        className={`flex-1 py-2 rounded-md transition duration-300 text-sm flex items-center justify-center ${course.status === 'published' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {course.status === 'published' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Nascondi
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Pubblica
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 py-2 rounded-md transition duration-300 text-sm flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
              Nessun corso trovato con i filtri selezionati. Prova a modificare i criteri di ricerca o crea un nuovo corso.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}