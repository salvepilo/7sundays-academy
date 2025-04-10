import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';

// Tipi
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'instructor';
  avatar?: string;
  joinedAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  completedCourses: number;
  completedTests: number;
  averageScore: number;
}

export default function AdminUsers() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

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

  // Carica gli utenti
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In una implementazione reale, questi dati verrebbero dal backend
        // Qui utilizziamo dati di esempio
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'Mario Rossi',
            email: 'mario.rossi@example.com',
            role: 'student',
            avatar: '/images/avatars/user1.jpg',
            joinedAt: '2023-06-15T10:30:00Z',
            lastLogin: '2023-08-20T14:45:00Z',
            status: 'active',
            completedCourses: 3,
            completedTests: 8,
            averageScore: 85,
          },
          {
            id: '2',
            name: 'Laura Bianchi',
            email: 'laura.bianchi@example.com',
            role: 'instructor',
            avatar: '/images/avatars/user2.jpg',
            joinedAt: '2023-05-20T09:15:00Z',
            lastLogin: '2023-08-19T11:30:00Z',
            status: 'active',
            completedCourses: 0,
            completedTests: 0,
            averageScore: 0,
          },
          {
            id: '3',
            name: 'Giuseppe Verdi',
            email: 'giuseppe.verdi@example.com',
            role: 'student',
            avatar: '/images/avatars/user3.jpg',
            joinedAt: '2023-07-10T13:45:00Z',
            lastLogin: '2023-08-15T16:20:00Z',
            status: 'inactive',
            completedCourses: 1,
            completedTests: 2,
            averageScore: 70,
          },
          {
            id: '4',
            name: 'Francesca Neri',
            email: 'francesca.neri@example.com',
            role: 'student',
            avatar: '/images/avatars/user4.jpg',
            joinedAt: '2023-08-01T11:00:00Z',
            lastLogin: '2023-08-18T09:30:00Z',
            status: 'active',
            completedCourses: 2,
            completedTests: 5,
            averageScore: 92,
          },
          {
            id: '5',
            name: 'Admin Principale',
            email: 'admin@7sundays.com',
            role: 'admin',
            avatar: '/images/avatars/admin.jpg',
            joinedAt: '2023-01-01T00:00:00Z',
            lastLogin: '2023-08-20T08:15:00Z',
            status: 'active',
            completedCourses: 0,
            completedTests: 0,
            averageScore: 0,
          },
          {
            id: '6',
            name: 'Roberto Marini',
            email: 'roberto.marini@example.com',
            role: 'student',
            avatar: '/images/avatars/user5.jpg',
            joinedAt: '2023-07-25T15:45:00Z',
            lastLogin: '2023-08-10T10:15:00Z',
            status: 'suspended',
            completedCourses: 0,
            completedTests: 1,
            averageScore: 45,
          },
        ];

        setUsers(mockUsers);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento degli utenti:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  // Filtra gli utenti in base ai criteri di ricerca
  const filteredUsers = users.filter(u => {
    const matchesSearch = searchQuery === '' || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Apre il modal con i dettagli dell'utente
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Cambia lo stato di un utente
  const handleChangeStatus = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    // In una implementazione reale, questa operazione verrebbe eseguita tramite API
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      )
    );

    // Se l'utente è attualmente selezionato, aggiorna anche quello
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
  };

  // Cambia il ruolo di un utente
  const handleChangeRole = (userId: string, newRole: 'student' | 'admin' | 'instructor') => {
    // In una implementazione reale, questa operazione verrebbe eseguita tramite API
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      )
    );

    // Se l'utente è attualmente selezionato, aggiorna anche quello
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  // Elimina un utente
  const handleDeleteUser = (userId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.')) {
      // In una implementazione reale, questa operazione verrebbe eseguita tramite API
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      // Se l'utente è attualmente selezionato, chiudi il modal
      if (selectedUser && selectedUser.id === userId) {
        setShowUserModal(false);
        setSelectedUser(null);
      }
    }
  };

  // Formatta la data
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestione Utenti | Admin 7Sundays Academy</title>
        <meta name="description" content="Gestione degli utenti per la piattaforma 7Sundays Academy" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gestione Utenti</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            <h2 className="text-xl font-semibold">Filtri</h2>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cerca utenti..."
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tutti i ruoli</option>
                <option value="student">Studenti</option>
                <option value="instructor">Istruttori</option>
                <option value="admin">Amministratori</option>
              </select>
              <select
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Attivi</option>
                <option value="inactive">Inattivi</option>
                <option value="suspended">Sospesi</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruolo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Iscritto il
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ultimo accesso
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                            user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {user.status === 'active' ? 'Attivo' : 
                            user.status === 'inactive' ? 'Inattivo' : 'Sospeso'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.joinedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Visualizza dettagli"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Elimina utente"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
              Nessun utente trovato con i filtri selezionati. Prova a modificare i criteri di ricerca.
            </div>
          )}
        </div>
      </div>

      {/* Modal per visualizzare i dettagli dell'utente */}
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
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 
                        selectedUser.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {selectedUser.status === 'active' ? 'Attivo' : 
                        selectedUser.status === 'inactive' ? 'Inattivo' : 'Sospeso'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Informazioni Account</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Iscritto il:</span>
                      <span className="font-medium">{formatDate(selectedUser.joinedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ultimo accesso:</span>
                      <span className="font-medium">{formatDate(selectedUser.lastLogin)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Statistiche</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Corsi completati:</span>
                      <span className="font-medium">{selectedUser.completedCourses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Test completati:</span>
                      <span className="font-medium">{selectedUser.completedTests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Punteggio medio:</span>
                      <span className="font-medium">{selectedUser.averageScore}%</span>
                    </div>
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
                      onChange={(e) => handleChangeRole(selectedUser.id, e.target.value as 'student' | 'admin' | 'instructor')}
                    >
                      <option value="student">Studente</option>
                      <option value="instructor">Istruttore</option>
                      <option value="admin">Amministratore</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cambia Stato</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={selectedUser.status}
                      onChange={(e) => handleChangeStatus(selectedUser.id, e.target.value as 'active' | 'inactive' | 'suspended')}
                    >
                      <option value="active">Attivo</option>
                      <option value="inactive">Inattivo</option>
                      <option value="suspended">Sospeso</option>
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
                    onClick={() => handleDeleteUser(selectedUser.id)}
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
    </AdminLayout>
  );
}