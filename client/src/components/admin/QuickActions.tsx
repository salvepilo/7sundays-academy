import React from 'react';
import Link from 'next/link';

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Azioni Rapide</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/dashboard/courses/create" className="group">
          <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg transition-all duration-200 hover:border-primary-500 hover:shadow-md">
            <div className="p-3 bg-primary-100 rounded-full group-hover:bg-primary-200">
              <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="mt-3 text-sm font-medium text-gray-900">Nuovo Corso</span>
            <span className="mt-1 text-xs text-gray-500">Crea un nuovo corso</span>
          </div>
        </Link>

        <Link href="/admin/dashboard/users" className="group">
          <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg transition-all duration-200 hover:border-primary-500 hover:shadow-md">
            <div className="p-3 bg-primary-100 rounded-full group-hover:bg-primary-200">
              <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="mt-3 text-sm font-medium text-gray-900">Gestione Utenti</span>
            <span className="mt-1 text-xs text-gray-500">Gestisci gli utenti</span>
          </div>
        </Link>

        <Link href="/admin/dashboard/stats" className="group">
          <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg transition-all duration-200 hover:border-primary-500 hover:shadow-md">
            <div className="p-3 bg-primary-100 rounded-full group-hover:bg-primary-200">
              <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="mt-3 text-sm font-medium text-gray-900">Statistiche</span>
            <span className="mt-1 text-xs text-gray-500">Visualizza le statistiche</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;