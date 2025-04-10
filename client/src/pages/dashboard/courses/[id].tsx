import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Componenti
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Tipi
interface Lesson {
  _id: string;
  title: string;
  description: string;
  duration: number;
  formattedDuration: string;
  order: number;
  isPublished: boolean;
  isWatched?: boolean;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: string;
  category: string;
  isPublished: boolean;
  instructor: {
    _id: string;
    name: string;
  };
  enrolledCount: number;
  averageRating: number;
  ratingsCount: number;
  lessons: Lesson[];
  requirements: string[];
  objectives: string[];
  isEnrolled?: boolean;
  progress?: number;
  completed?: boolean;
}

export default function CourseDetail() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica i dettagli del corso
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`/api/courses/${id}`, { headers });
        setCourse(response.data.data.course);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento del corso:', error);
        setIsLoading(false);
        setError('Impossibile caricare i dettagli del corso. Riprova più tardi.');
        
        // Dati di esempio in caso di errore
        const mockCourse: Course = {
          _id: id as string,
          title: 'Introduzione al Marketing Digitale',
          description: 'Impara le basi del marketing digitale e come applicarle al tuo business. Questo corso ti fornirà tutte le conoscenze necessarie per iniziare a creare una strategia di marketing digitale efficace per la tua azienda o per i tuoi clienti.',
          thumbnail: '/images/courses/digital-marketing.jpg',
          duration: '4h 30m',
          level: 'principiante',
          category: 'Marketing',
          isPublished: true,
          instructor: {
            _id: '101',
            name: 'Marco Rossi'
          },
          enrolledCount: 120,
          averageRating: 4.5,
          ratingsCount: 45,
          lessons: [
            {
              _id: 'l1',
              title: 'Introduzione al Marketing Digitale',
              description: 'Panoramica del corso e concetti fondamentali',
              duration: 1200,
              formattedDuration: '00:20:00',
              order: 1,
              isPublished: true
            },
            {
              _id: 'l2',
              title: 'Strategie di Content Marketing',
              description: 'Come creare contenuti efficaci per il tuo pubblico',
              duration: 1800,
              formattedDuration: '00:30:00',
              order: 2,
              isPublished: true
            },
            {
              _id: 'l3',
              title: 'SEO Basics',
              description: 'Fondamenti di ottimizzazione per i motori di ricerca',
              duration: 2400,
              formattedDuration: '00:40:00',
              order: 3,
              isPublished: true
            },
            {
              _id: 'l4',
              title: 'Email Marketing',
              description: 'Come creare campagne email efficaci',
              duration: 1500,
              formattedDuration: '00:25:00',
              order: 4,
              isPublished: true
            },
            {
              _id: 'l5',
              title: 'Social Media Marketing',
              description: 'Strategie per i principali social network',
              duration: 2100,
              formattedDuration: '00:35:00',
              order: 5,
              isPublished: true
            },
          ],
          requirements: [
            'Conoscenze di base di marketing',
            'Computer con accesso a internet',
            'Nessuna esperienza di programmazione richiesta'
          ],
          objectives: [
            'Comprendere i principi fondamentali del marketing digitale',
            'Creare una strategia di content marketing efficace',
            'Implementare tecniche SEO di base',
            'Sviluppare campagne email marketing',
            'Utilizzare i social media per promuovere il tuo business'
          ],
          isEnrolled: false,
          progress: 0
        };
        
        setCourse(mockCourse);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  // Gestisce l'iscrizione al corso
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/courses/${id}`);
      return;
    }

    try {
      setEnrolling(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`/api/courses/${id}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Aggiorna lo stato del corso
      setCourse(prev => prev ? { ...prev, isEnrolled: true, progress: 0 } : null);
      
      setEnrolling(false);
    } catch (error) {
      console.error('Errore durante l\'iscrizione al corso:', error);
      setEnrolling(false);
      setError('Impossibile completare l\'iscrizione. Riprova più tardi.');
    }
  };

  // Reindirizza alla lezione
  const goToLesson = (lessonId: string) => {
    router.push(`/lessons/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Corso non trovato</h2>
            <p className="text-gray-600 mb-4">Il corso che stai cercando non esiste o non è disponibile.</p>
            <Link href="/courses" className="btn-primary">
              Torna ai Corsi
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{course.title} | 7Sundays Academy</title>
        <meta name="description" content={course.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-primary-600">
                  Home
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary-600">
                  Corsi
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li className="text-primary-600 font-medium truncate">{course.title}</li>
            </ol>
          </nav>

          {/* Messaggio di errore */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonna sinistra: Dettagli del corso */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Immagine del corso */}
                <div className="aspect-video bg-gray-200 relative">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500 font-medium">Anteprima non disponibile</span>
                    </div>
                  )}
                </div>

                {/* Contenuto del corso */}
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-5 w-5 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {course.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-5 w-5 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {course.enrolledCount} iscritti
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-5 w-5 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                      </svg>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-5 w-5 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                      </svg>
                      {course.averageRating.toFixed(1)} ({course.ratingsCount} recensioni)
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Descrizione</h2>
                    <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                  </div>

                  {/* Obiettivi del corso */}
                  {course.objectives && course.objectives.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">Cosa imparerai</h2>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requisiti */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">Requisiti</h2>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {course.requirements.map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Informazioni sull'istruttore */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Istruttore</h2>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg mr-4">
                        {course.instructor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{course.instructor.name}</h3>
                        <p className="text-sm text-gray-600">Esperto di {course.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenuto del corso (lezioni) */}
              <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenuto del Corso</h2>
                  <p className="text-gray-600 mb-6">{course.lessons.length} lezioni · {course.duration} di contenuto totale</p>

                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <div key={lesson._id} className="border border-gray-200 rounded-md overflow-hidden">
                        <div 
                          className={`p-4 flex justify-between items-center cursor-pointer ${course.isEnrolled ? 'hover:bg-gray-50' : ''}`}
                          onClick={() => course.isEnrolled && goToLesson(lesson._id)}
                        >
                          <div className="flex items-start">
                            {lesson.isWatched ? (
                              <svg className="h-6 w-6 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6 mr-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{lesson.formattedDuration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonna destra: Iscrizione e progresso */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                {course.isEnrolled ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Il tuo progresso</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{course.progress}% completato</p>
                    </div>
                    
                    <Link 
                      href={`/lessons/${course.lessons[0]?._id}`}
                      className="btn-primary w-full text-center mb-4"
                    >
                      {course.progress === 0 ? 'Inizia il Corso' : 'Continua a Studiare'}
                    </Link>
                    
                    {course.completed ? (
                      <Link 
                        href={`/courses/${course._id}/certificate`}
                        className="btn-secondary w-full text-center"
                      >
                        Visualizza Certificato
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-6">
                      <p className="text-3xl font-bold text-gray-900 mb-2">Gratuito</p>
                      <p className="text-gray-600">Accesso completo a tutte le lezioni</p>
                    </div>
                    
                    <button 
                      className={`btn-primary w-full ${enrolling ? 'opacity-75 cursor-not-allowed' : ''}`}
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Iscrizione in corso...' : 'Iscriviti al Corso'}
                    </button>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-start">
                        <svg className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Accesso illimitato</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Certificato di completamento</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="text-gray-700">Materiali didattici scaricabili</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}