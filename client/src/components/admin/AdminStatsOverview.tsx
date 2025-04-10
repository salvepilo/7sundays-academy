import React from 'react';
import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, change, description }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
              {change && (
                <dd className="flex items-center text-sm text-gray-500">
                  {change.isPositive ? (
                    <span className="text-green-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {change.value}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      {change.value}%
                    </span>
                  )}
                  <span className="ml-2">{description}</span>
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AdminStatsOverviewProps {
  className?: string;
}

const AdminStatsOverview: React.FC<AdminStatsOverviewProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalTests: 0,
    totalEnrollments: 0,
    completionRate: 0,
    averageTestScore: 0,
    newUsersThisMonth: 0,
    newEnrollmentsThisMonth: 0,
    userGrowthRate: 0,
    enrollmentGrowthRate: 0,
  });

  useEffect(() => {
    // In una implementazione reale, questi dati verrebbero dal backend
    // Qui utilizziamo dati di esempio
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        activeUsers: 875,
        totalCourses: 24,
        totalLessons: 312,
        totalTests: 48,
        totalEnrollments: 3450,
        completionRate: 68,
        averageTestScore: 76,
        newUsersThisMonth: 125,
        newEnrollmentsThisMonth: 320,
        userGrowthRate: 12,
        enrollmentGrowthRate: 8,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-200 rounded-md p-3 h-12 w-12"></div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Utenti Totali"
          value={stats.totalUsers}
          icon={
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          change={{ value: stats.userGrowthRate, isPositive: true }}
          description="rispetto al mese scorso"
        />
        <StatsCard
          title="Utenti Attivi"
          value={stats.activeUsers}
          icon={
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          change={{ value: 5, isPositive: true }}
          description="rispetto al mese scorso"
        />
        <StatsCard
          title="Corsi Totali"
          value={stats.totalCourses}
          icon={
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          change={{ value: 3, isPositive: true }}
          description="nuovi corsi questo mese"
        />
        <StatsCard
          title="Iscrizioni Totali"
          value={stats.totalEnrollments}
          icon={
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          change={{ value: stats.enrollmentGrowthRate, isPositive: true }}
          description="rispetto al mese scorso"
        />
        <StatsCard
          title="Tasso di Completamento"
          value={`${stats.completionRate}%`}
          icon={
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          change={{ value: 2, isPositive: true }}
          description="rispetto al mese scorso"
        />
        <StatsCard
          title="Punteggio Medio Test"
          value={`${stats.averageTestScore}/100`}
          icon={
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          change={{ value: 1, isPositive: true }}
          description="rispetto al mese scorso"
        />
        <StatsCard
          title="Lezioni Totali"
          value={stats.totalLessons}
          icon={
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          change={{ value: 8, isPositive: true }}
          description="nuove lezioni questo mese"
        />
        <StatsCard
          title="Test Totali"
          value={stats.totalTests}
          icon={
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          change={{ value: 4, isPositive: true }}
          description="nuovi test questo mese"
        />
      </div>
    </div>
  );
};

export default AdminStatsOverview;