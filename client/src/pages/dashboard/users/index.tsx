import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Componenti
import DashboardLayout from '@/components/layout/DashboardLayout';

// Mock data
import { mockUsers } from '@/mock/users';

// Tipi
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  enrolledCourses: number;
  avatar?: string;
}

export default function UserDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Carica gli utenti
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/users?page=${currentPage}&search=${searchTerm}`);
        setUsers(response.data.users);
        setTotalPages(Math.ceil(response.data.total / 10));
        setUseMockData(false);
      } catch (error) {
        console.error('Errore nel caricamento degli utenti, usando dati mockup:', error);
        setUsers(mockUsers);
        setTotalPages(1);
        setUseMockData(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, currentPage, searchTerm]);

  // Elimina un utente
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      try {
        if (!useMockData) {
          await axios.delete(`/api/users/${userId}`);
        }
        setUsers(users.filter(user => user._id !== userId));
        toast.success('Utente eliminato con successo');
      } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
        toast.error('Errore nell\'eliminazione dell\'utente');
      }
    }
  };

  // Aggiorna il ruolo di un utente
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      if (!useMockData) {
        await axios.patch(`/api/users/${userId}`, { role: newRole });
      }
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      toast.success('Ruolo utente aggiornato con successo');
    } catch (error) {
      console.error('Errore nell\'aggiornamento del ruolo:', error);
      toast.error('Errore nell\'aggiornamento del ruolo');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Gestione Utenti | 7Sundays Academy</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Gestione Utenti</h1>
            <button
              onClick={() => router.push('/dashboard/users/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiUserPlus className="mr-2" />
              Nuovo Utente
            </button>
          </div>

          {useMockData && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700">
                Attenzione: Stai utilizzando dati mockup perché l'API non è disponibile.
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Cerca utenti..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
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
                      Ruolo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Registrazione
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corsi Iscritti
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar || '/images/avatars/default.jpg'}
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {user.role === 'admin' ? 'Amministratore' : 
                            user.role === 'instructor' ? 'Istruttore' : 'Studente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.enrolledCourses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Nessun utente trovato</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                      ${currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Dettagli Utente</h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
                <img 
                  src={selectedUser.avatar || '/images/avatars/default.jpg'} 
                  alt={selectedUser.name} 
                  className="h-24 w-24 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="mt-2 space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        selectedUser.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {selectedUser.role === 'admin' ? 'Amministratore' : 
                        selectedUser.role === 'instructor' ? 'Istruttore' : 'Studente'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Gestione Utente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cambia Ruolo</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={selectedUser.role}
                      onChange={(e) => handleUpdateRole(selectedUser._id, e.target.value)}
                    >
                      <option value="student">Studente</option>
                      <option value="instructor">Istruttore</option>
                      <option value="admin">Amministratore</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition duration-300"
                  >
                    Chiudi
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300"
                  >
                    Elimina Utente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 