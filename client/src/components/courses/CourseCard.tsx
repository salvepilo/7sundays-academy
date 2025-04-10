import React from 'react';
import Link from 'next/link';

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

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg transition-all duration-200 hover:shadow-md">
      <div className="relative pb-1/2">
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          {course.thumbnail ? (
            <img 
              src={`/images/courses/${course.thumbnail}`} 
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
          {course.completed && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completato
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {course.duration}
          
          <span className="mx-2">•</span>
          
          <svg className="mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {course.lessonsCount} lezioni
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Progresso</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${course.completed ? 'bg-green-500' : 'bg-primary-500'}`} 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
        
        <Link 
          href={`/dashboard/courses/${course.id}`}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {course.progress > 0 ? 'Continua' : 'Inizia'}
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;

// Aggiungi questo CSS globale o in un modulo CSS
// .pb-1/2 {
//   padding-bottom: 50%;
// }
// .line-clamp-2 {
//   display: -webkit-box;
//   -webkit-line-clamp: 2;
//   -webkit-box-orient: vertical;
//   overflow: hidden;
// }