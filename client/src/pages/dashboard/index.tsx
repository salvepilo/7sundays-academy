import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import DashboardLayout from '@/components/layout/DashboardLayout';
import CourseCard from '@/components/courses/CourseCard';
import ProgressChart from '@/components/dashboard/ProgressChart';

// Tipi
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  lessonsCount: number;
  progress: number;
  completed: boolean;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Carica i corsi dell'utente
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
            duration: '4h 30m',
            lessonsCount: 12,
            progress: 75,
            completed: false,
          },
          {
            id: '2',
            title: 'Social Media Strategy',
            description: 'Sviluppa una strategia efficace per i social media e aumenta la tua presenza online.',
            thumbnail: '/images/courses/social-media.jpg',
            duration: '3h 45m',
            lessonsCount: 10,
            progress: 40,
            completed: false,
          },
          {
            id: '3',
            title: 'SEO Avanzato',
            description: 'Tecniche avanzate di ottimizzazione per i motori di ricerca per migliorare il posizionamento del tuo sito.',
            thumbnail: '/images/courses/seo.jpg',
            duration: '5h 15m',
            lessonsCount: 15,
            progress: 20,
            completed: false,
          },
        ];

        setCourses(mockCourses);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei corsi:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCourses();
    }
  }, [isAuthenticated]);

  // Calcola le statistiche dell'utente
  const totalCourses = courses.length;
  const completedCourses = courses.filter(course => course.completed).length;
  const inProgressCourses = courses.filter(course => !course.completed && course.progress > 0).length;
  const averageProgress = courses.length > 0 
    ? Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length) 
    : 0;

  // Dati per il grafico di progresso
  const chartData = {
    labels: ['Completati', 'In Corso', 'Non Iniziati'],
    datasets: [
      {
        data: [
          completedCourses,
          inProgressCourses,
          totalCourses - completedCourses - inProgressCourses
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#9CA3AF'],
        borderWidth: 0,
      },
    ],
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard - 7Sundays Academy</title>
        <meta name="description" content="La tua dashboard personale su 7Sundays Academy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
          {/* Benvenuto */}
          <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
              <h2 className="text-xl font-bold">Benvenuto, {user?.name}!</h2>
              <p className="mt-1">Continua il tuo percorso di apprendimento. Hai completato il {averageProgress}% dei tuoi corsi.</p>
            </div>
          </div>

          {/* Statistiche */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Corsi Totali */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Corsi Totali</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{totalCourses}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Corsi Completati */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Corsi Completati</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{completedCourses}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Corsi In Corso */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Corsi In Corso</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{inProgressCourses}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Progresso Medio */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Progresso Medio</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{averageProgress}%</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grafico di Progresso e Prossimi Corsi */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Grafico di Progresso */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg lg:col-span-1">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Progresso dei Corsi</h3>
                <div className="mt-4 h-64">
                  <ProgressChart data={chartData} />
                </div>
              </div>
            </div>

            {/* Prossimi Corsi */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">I Tuoi Corsi</h3>
                  <Link href="/courses" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Vedi tutti i corsi
                  </Link>
                </div>
                <div className="mt-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                  ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {courses.slice(0, 4).map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Non hai ancora iscrizioni a corsi.</p>
                      <Link href="/courses" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Esplora i corsi disponibili
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Test e Certificazioni */}
          <div className="mt-8 bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Test e Certificazioni</h3>
              <div className="mt-4">
                {completedCourses > 0 ? (
                  <div className="divide-y divide-gray-200">
                    <div className="py-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Introduzione al Marketing Digitale</h4>
                        <p className="text-sm text-gray-500">Test finale completato con successo</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        85%
                      </span>
                    </div>
                    <div className="py-4">
                      <Link href="/tests" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        Vedi tutti i test
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Completa un corso per accedere al test finale.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Area Networking */}
          <div className="mt-8 bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Area Networking</h3>
              <div className="mt-4">
                {completedCourses > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Marco Rossi</h4>
                          <p className="text-sm text-gray-500">Digital Marketing Manager</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                          Visualizza profilo
                        </a>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Laura Bianchi</h4>
                          <p className="text-sm text-gray-500">Social Media Specialist</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                          Visualizza profilo
                        </a>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Giovanni Verdi</h4>
                          <p className="text-sm text-gray-500">SEO Specialist</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                          Visualizza profilo
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Completa almeno un corso per accedere all'area networking.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Area "Lavora con Noi" */}
          <div className="mt-8 bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Area "Lavora con Noi"</h3>
              <div className="mt-4">
                {completedCourses > 0 && averageProgress === 100 ? (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          Congratulazioni! Hai completato tutti i corsi con il massimo dei voti. Accedi all'area "Lavora con Noi" per scoprire le opportunità disponibili.
                        </p>
                        <div className="mt-4">
                          <Link href="/careers" className="text-sm font-medium text-green-700 hover:text-green-600">
                            Vai all'area "Lavora con Noi" →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Per accedere all'area "Lavora con Noi", devi completare tutti i corsi con il 100% dei punti nel test finale.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}