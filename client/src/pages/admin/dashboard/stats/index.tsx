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
        setIsLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await axios.get('/api/admin/stats');
        setStats(statsResponse.data);

        // Fetch monthly statistics
        const monthlyResponse = await axios.get('/api/admin/stats/monthly');
        setMonthlyStats(monthlyResponse.data);

        // Fetch course completion statistics
        const completionResponse = await axios.get('/api/admin/stats/completion');
        setCourseCompletionStats(completionResponse.data);

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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Iscrizioni Recenti</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Corso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentEnrollments.map((enrollment) => (
                  <tr key={`${enrollment.userId}-${enrollment.courseId}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {enrollment.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enrollment.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(enrollment.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Corsi Popolari</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Corso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iscrizioni</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.popularCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.enrollments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      €{course.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StatsPage;