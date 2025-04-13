import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import QuickActions from '@/components/admin/QuickActions';
import { useRouter } from 'next/router';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  completionRate: number;
  totalRevenue: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    joinDate: string;
  }>;
  popularCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    rating: number;
  }>;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    completionRate: 0,
    totalRevenue: 0,
    recentUsers: [],
    popularCourses: []
  });

  useEffect(() => {
    // TODO: Implementare la chiamata API per ottenere le statistiche
    // Dati di esempio
    setStats({
      totalUsers: 1250,
      activeUsers: 850,
      totalCourses: 45,
      completionRate: 78,
      totalRevenue: 52000,
      recentUsers: [
        { id: '1', name: 'Mario Rossi', email: 'mario@example.com', joinDate: '2024-01-15' },
        { id: '2', name: 'Laura Bianchi', email: 'laura@example.com', joinDate: '2024-01-14' },
        { id: '3', name: 'Giuseppe Verdi', email: 'giuseppe@example.com', joinDate: '2024-01-13' },
      ],
      popularCourses: [
        { id: '1', title: 'Marketing Digitale Avanzato', enrollments: 120, rating: 4.8 },
        { id: '2', title: 'Leadership e Gestione Team', enrollments: 95, rating: 4.7 },
        { id: '3', title: 'Strategie di Vendita B2B', enrollments: 85, rating: 4.6 },
      ]
    });
  }, []);

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Quick Actions */}
          <div className="mt-6">
            <QuickActions />
          </div>

          {/* Statistiche principali */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Utenti Totali</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <span className="sr-only">Crescita</span>+12%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Corsi Attivi</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tasso di Completamento</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.completionRate}%</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Corsi Popolari e Utenti Recenti */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Corsi Popolari */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Corsi Più Popolari</h3>
                <div className="mt-5">
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {stats.popularCourses.map((course) => (
                        <li key={course.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                              <p className="text-sm text-gray-500">{course.enrollments} iscritti • {course.rating} ★</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Utenti Recenti */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Utenti Recenti</h3>
                <div className="mt-5">
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {stats.recentUsers.map((user) => (
                        <li key={user.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <p className="text-xs text-gray-400">Iscritto il {new Date(user.joinDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;