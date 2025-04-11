import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProgressChart from './ProgressChart';
import CourseCard from '../courses/CourseCard';

interface DashboardOverviewProps {
  courses: Array<{
    id: string;
    title: string;
    description: string;
    coverImage: string;
    duration: string;
    lessonsCount: number;
    progress: number;
    completed: boolean;
  }>;
  stats: {
    completedCourses: number;
    totalCourses: number;
    averageScore: number;
    totalLessons: number;
    completedLessons: number;
  };
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ courses, stats }) => {
  const { user } = useAuth();

  const chartData = {
    labels: ['Completati', 'In Corso', 'Da Iniziare'],
    datasets: [{
      data: [
        stats.completedCourses,
        courses.filter(c => c.progress > 0 && !c.completed).length,
        courses.filter(c => c.progress === 0).length
      ],
      backgroundColor: ['#10B981', '#6366F1', '#E5E7EB'],
      borderWidth: 0
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header con saluto e statistiche principali */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Benvenuto, {user?.name}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-primary-600 text-sm font-medium">Corsi Completati</p>
            <p className="text-2xl font-bold text-primary-900">{stats.completedCourses}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-600 text-sm font-medium">Media Voti Test</p>
            <p className="text-2xl font-bold text-green-900">{stats.averageScore}%</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-purple-600 text-sm font-medium">Lezioni Completate</p>
            <p className="text-2xl font-bold text-purple-900">{stats.completedLessons}/{stats.totalLessons}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-600 text-sm font-medium">Progresso Totale</p>
            <p className="text-2xl font-bold text-blue-900">
              {Math.round((stats.completedCourses / stats.totalCourses) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Sezione con grafico e corsi in corso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafico progresso */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Il Tuo Progresso</h2>
          <div className="h-64">
            <ProgressChart data={chartData} />
          </div>
        </div>

        {/* Corsi in corso */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Corsi in Corso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses
              .filter(course => course.progress > 0 && !course.completed)
              .slice(0, 2)
              .map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </div>
      </div>

      {/* Sezione corsi completati recentemente */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Corsi Completati Recentemente</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses
            .filter(course => course.completed)
            .slice(0, 3)
            .map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;