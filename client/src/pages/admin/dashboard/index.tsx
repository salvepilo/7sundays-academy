import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';
import ErrorDisplay from '@/components/common/ErrorDisplay';

// Tipi
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalTests: number;
  totalEnrollments: number;
  completionRate: number;
  averageTestScore: number;
}

interface TopCourse {
  _id: string;
  title: string;
  enrolledCount: number;
  completionRate: number;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  enrolledCourses: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reindirizza se l'utente non è admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router, user]);

  // Carica i dati della dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user || user.role !== 'admin') return;

      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        // Ottieni le statistiche generali
        const statsResponse = await axios.get('/api/courses/stats/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats(statsResponse.data.data.stats);
        
        // Ottieni i corsi più popolari
        const coursesResponse = await axios.get('/api/courses?sort=-enrolledCount&limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTopCourses(coursesResponse.data.data.courses);
        
        // Ottieni gli utenti più recenti
        const usersResponse = await axios.get('/api/users?sort=-createdAt&limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRecentUsers(usersResponse.data.data.users);
        
      } catch (error) {
        console.error('Errore nel caricamento dei dati della dashboard:', error);
        setError('Impossibile caricare i dati della dashboard. Riprova più tardi.');
        toast.error('Impossibile caricare i dati della dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  // Formatta la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null; // Reindirizzato nel useEffect
  }

  if (error) {
    return (
      <AdminLayout>
        <ErrorDisplay 
          message={error} 
          onRetry={() => router.reload()}
        />
      </AdminLayout>
    );
  }

  // Se non ci sono dati, mostra un messaggio appropriato
  const hasNoData = !stats || topCourses.length === 0 || recentUsers.length === 0;

  return (
    <AdminLayout>
      <Head>
        <title>Dashboard Amministrativa | 7Sundays Academy</title>
        <meta name="description" content="Dashboard amministrativa per la gestione della piattaforma" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-6">
        <div className="px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Amministrativa</h1>
          <p className="mt-1 text-sm text-gray-600">Panoramica della piattaforma e statistiche</p>
        </div>

        {hasNoData ? (
          <div className="mt-6 px-4 sm:px-6 md:px-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Nessun dato disponibile nella dashboard. Aggiungi corsi e utenti per visualizzare le statistiche.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Statistiche generali */}
            <div className="mt-6 px-4 sm:px-6 md:px-8">
              <h2 className="text-lg font-medium text-gray-900">Statistiche Generali</h2>
              <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Utenti */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Utenti Totali</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link href="/admin/users" className="font-medium text-primary-600 hover:text-primary-500">
                        Visualizza tutti gli utenti
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Corsi */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Corsi Totali</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stats?.totalCourses || 0}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link href="/admin/courses" className="font-medium text-primary-600 hover:text-primary-500">
                        Gestisci corsi
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Iscrizioni */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Iscrizioni Totali</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stats?.totalEnrollments || 0}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link href="/admin/enrollments" className="font-medium text-primary-600 hover:text-primary-500">
                        Visualizza iscrizioni
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Tasso di completamento */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Tasso di Completamento</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stats?.completionRate || 0}%</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link href="/admin/reports" className="font-medium text-primary-600 hover:text-primary-500">
                        Visualizza report
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Corsi più popolari */}
            <div className="mt-8 px-4 sm:px-6 md:px-8">
              <h2 className="text-lg font-medium text-gray-900">Corsi Più Popolari</h2>
              <div className="mt-2 flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      {topCourses.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Titolo
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Iscritti
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Completamento
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Azioni
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {topCourses.map((course) => (
                              <tr key={course._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{course.enrolledCount}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                      <div 
                                        className="bg-primary-600 h-2.5 rounded-full" 
                                        style={{ width: `${course.completionRate}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-900">{course.completionRate}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <Link href={`/admin/courses/${course._id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                                    Visualizza
                                  </Link>
                                  <Link href={`/admin/courses/${course._id}/edit`} className="text-primary-600 hover:text-primary-900">
                                    Modifica
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm">Nessun corso registrato</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Utenti recenti */}
            <div className="mt-8 px-4 sm:px-6 md:px-8">
              <h2 className="text-lg font-medium text-gray-900">Utenti Recenti</h2>
              <div className="mt-2 flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      {recentUsers.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data Registrazione
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Corsi Iscritti
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Azioni
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {recentUsers.map((user) => (
                              <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.enrolledCourses}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <Link href={`/admin/users/${user._id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                                    Visualizza
                                  </Link>
                                  <Link href={`/admin/users/${user._id}/edit`} className="text-primary-600 hover:text-primary-900">
                                    Modifica
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm">Nessun utente registrato</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Azioni rapide */}
        <div className="mt-8 px-4 sm:px-6 md:px-8">
          <h2 className="text-lg font-medium text-gray-900">Azioni Rapide</h2>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Crea Nuovo Corso</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Aggiungi un nuovo corso alla piattaforma
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/admin/courses/new" className="font-medium text-primary-600 hover:text-primary-500">
                    Crea corso
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Crea Nuovo Test</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Aggiungi un nuovo test per un corso
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/admin/tests/new" className="font-medium text-primary-600 hover:text-primary-500">
                    Crea test
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Visualizza Report</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Analizza le statistiche della piattaforma
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/admin/reports" className="font-medium text-primary-600 hover:text-primary-500">
                    Visualizza report
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}