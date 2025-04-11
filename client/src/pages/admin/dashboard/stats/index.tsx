import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

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

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeSubscriptions: number;
  recentEnrollments: Array<{
    userId: string;
    courseId: string;
    date: string;
    userName: string;
    courseName: string;
  }>;
  popularCourses: Array<{
    id: string;
    name: string;
    enrollments: number;
    revenue: number;
  }>;
}

const StatsPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [courseCompletionStats, setCourseCompletionStats] = useState<CourseCompletionStats[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    recentEnrollments: [],
    popularCourses: []
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

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche:', error);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchAdminStats();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Utenti Totali</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
              <FiUsers className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Corsi Totali</p>
                <h3 className="text-2xl font-bold">{stats.totalCourses}</h3>
              </div>
              <FiBook className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Ricavi Totali</p>
                <h3 className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</h3>
              </div>
              <FiDollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Iscrizioni Attive</p>
                <h3 className="text-2xl font-bold">{stats.activeSubscriptions}</h3>
              </div>
              <FiTrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Iscrizioni Recenti</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Corso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentEnrollments.map((enrollment, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{enrollment.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{enrollment.courseName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(enrollment.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {stats.recentEnrollments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Nessuna iscrizione recente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Corsi Popolari</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Corso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Iscrizioni
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ricavi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.popularCourses.map((course, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{course.enrollments}</td>
                    <td className="px-6 py-4 whitespace-nowrap">€{course.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {stats.popularCourses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Nessun corso disponibile
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StatsPage;