import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';
import AdminStatsOverview from '@/components/admin/AdminStatsOverview';

// Tipi
interface MonthlyStats {
  month: string;
  users: number;
  enrollments: number;
  completions: number;
  testAttempts: number;
}

interface CourseCompletionStats {
  courseName: string;
  enrollments: number;
  completions: number;
  completionRate: number;
}

export default function AdminStats() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [courseCompletionStats, setCourseCompletionStats] = useState<CourseCompletionStats[]>([]);

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

  // Carica le statistiche
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In una implementazione reale, questi dati verrebbero dal backend
        // Qui utilizziamo dati di esempio
        
        // Statistiche mensili
        const mockMonthlyStats: MonthlyStats[] = [
          { month: 'Gen', users: 45, enrollments: 120, completions: 35, testAttempts: 80 },
          { month: 'Feb', users: 52, enrollments: 145, completions: 42, testAttempts: 95 },
          { month: 'Mar', users: 58, enrollments: 160, completions: 48, testAttempts: 110 },
          { month: 'Apr', users: 65, enrollments: 180, completions: 55, testAttempts: 125 },
          { month: 'Mag', users: 72, enrollments: 200, completions: 62, testAttempts: 140 },
          { month: 'Giu', users: 80, enrollments: 220, completions: 70, testAttempts: 155 },
        ];
        
        // Statistiche di completamento dei corsi
        const mockCourseCompletionStats: CourseCompletionStats[] = [
          { courseName: 'Introduzione al Marketing Digitale', enrollments: 156, completions: 98, completionRate: 62.8 },
          { courseName: 'SEO Avanzato', enrollments: 89, completions: 45, completionRate: 50.6 },
          { courseName: 'Social Media Strategy', enrollments: 124, completions: 82, completionRate: 66.1 },
          { courseName: 'Email Marketing Efficace', enrollments: 78, completions: 56, completionRate: 71.8 },
          { courseName: 'Content Marketing', enrollments: 112, completions: 67, completionRate: 59.8 },
        ];
        
        setMonthlyStats(mockMonthlyStats);
        setCourseCompletionStats(mockCourseCompletionStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  return (
    <AdminLayout>
      <Head>
        <title>Statistiche | 7Sundays Academy Admin</title>
      </Head>

      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Statistiche della Piattaforma</h1>
        <p className="mt-1 text-sm text-gray-500">
          Panoramica delle statistiche e delle metriche della piattaforma
        </p>

        {/* Statistiche generali */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Panoramica</h2>
          <AdminStatsOverview className="mt-3" />
        </div>

        {/* Grafici statistiche mensili */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Andamento Mensile</h2>
          <div className="mt-3 bg-white shadow rounded-lg p-6">
            {isLoading ? (
              <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
            ) : (
              <div className="h-80">
                {/* In una implementazione reale, qui ci sarebbe un grafico */}
                <div className="flex h-full items-end">
                  {monthlyStats.map((stat, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex justify-around">
                        <div className="w-4 bg-blue-500 rounded-t" style={{ height: `${stat.users * 2}px` }}></div>
                        <div className="w-4 bg-green-500 rounded-t" style={{ height: `${stat.enrollments / 2}px` }}></div>
                        <div className="w-4 bg-yellow-500 rounded-t" style={{ height: `${stat.completions * 2}px` }}></div>
                        <div className="w-4 bg-purple-500 rounded-t" style={{ height: `${stat.testAttempts}px` }}></div>
                      </div>
                      <div className="mt-2 text-xs font-medium text-gray-500">{stat.month}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Nuovi Utenti</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Iscrizioni</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Completamenti</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
                    <span className="text-xs text-gray-500">Tentativi Test</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabella completamento corsi */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Completamento Corsi</h2>
          <div className="mt-3 bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="animate-pulse p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corso
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Iscrizioni
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completamenti
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasso di Completamento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courseCompletionStats.map((course, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.courseName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.enrollments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.completions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2">{course.completionRate.toFixed(1)}%</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${course.completionRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}