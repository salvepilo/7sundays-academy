import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiBook, FiVideo, FiClipboard, FiSettings, 
  FiBarChart2, FiMessageSquare, FiPlus, FiAlertCircle,
  FiTrendingUp, FiDollarSign, FiClock, FiCheckCircle
} from 'react-icons/fi';
import Link from 'next/link';
import AdminLayout from '@/components/layouts/AdminLayout';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  activeCourses: number;
  monthlyEnrollments: number;
  totalRevenue: number;
  averageCompletionRate: number;
  systemStatus: {
    database: boolean;
    storage: boolean;
    email: boolean;
  };
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'course_creation' | 'user_registration' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeCourses: 0,
    monthlyEnrollments: 0,
    totalRevenue: 0,
    averageCompletionRate: 0,
    systemStatus: {
      database: true,
      storage: true,
      email: true
    }
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch dashboard statistics
        const statsResponse = await axios.get('/api/admin/stats');
        setStats(statsResponse.data);

        // Fetch recent activities
        const activitiesResponse = await axios.get('/api/admin/activities');
        setRecentActivities(activitiesResponse.data);
      } catch (error) {
        toast.error('Errore nel caricamento dei dati della dashboard');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: boolean) => 
    status ? 'text-green-500' : 'text-red-500';

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <FiUsers className="w-5 h-5 text-blue-500" />;
      case 'course_creation':
        return <FiBook className="w-5 h-5 text-green-500" />;
      case 'user_registration':
        return <FiPlus className="w-5 h-5 text-purple-500" />;
      case 'payment':
        return <FiDollarSign className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100">
        <div className="p-6">
          {/* Quick Actions */}
          <div className="mb-6 flex flex-wrap gap-4">
            <Link
              href="/admin/dashboard/courses/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPlus className="mr-2" />
              Nuovo Corso
            </Link>
            <Link
              href="/admin/dashboard/users/create"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiUsers className="mr-2" />
              Nuovo Utente
            </Link>
            <Link
              href="/admin/dashboard/settings"
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FiSettings className="mr-2" />
              Impostazioni
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Utenti Totali</h3>
                <FiUsers className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500 mt-1">+12% rispetto al mese scorso</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Corsi Attivi</h3>
                <FiBook className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeCourses}</p>
              <p className="text-sm text-gray-500 mt-1">+3 nuovi corsi questo mese</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Fatturato Totale</h3>
                <FiDollarSign className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-yellow-600 mt-2">€{stats.totalRevenue}</p>
              <p className="text-sm text-gray-500 mt-1">+15% rispetto al mese scorso</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Tasso di Completamento</h3>
                <FiCheckCircle className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.averageCompletionRate}%</p>
              <p className="text-sm text-gray-500 mt-1">Media di completamento dei corsi</p>
            </div>
          </div>

          {/* System Status and Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Stato del Sistema</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Database</span>
                  <FiCheckCircle className={`w-5 h-5 ${getStatusColor(stats.systemStatus.database)}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Storage</span>
                  <FiCheckCircle className={`w-5 h-5 ${getStatusColor(stats.systemStatus.storage)}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Email Service</span>
                  <FiCheckCircle className={`w-5 h-5 ${getStatusColor(stats.systemStatus.email)}`} />
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Attività Recenti</h3>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        {activity.user && (
                          <p className="text-xs text-gray-400 mt-1">
                            Utente: {activity.user.name} ({activity.user.email})
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Nessuna attività recente</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;