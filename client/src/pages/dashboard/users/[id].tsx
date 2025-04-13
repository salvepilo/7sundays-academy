import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
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

export default function UserDetails() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [useMockData, setUseMockData] = useState(false);

  // Reindirizza alla pagina di login se l'utente non è autenticato
  if (!loading && !isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        const response = await axios.get(`/api/users/${id}`);
        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
        setUseMockData(false);
      } catch (error) {
        console.error('Errore nel caricamento dell\'utente, usando dati mockup:', error);
        const mockUser = mockUsers.find(u => u._id === id);
        if (mockUser) {
          setUser(mockUser);
          setFormData({
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role
          });
        }
        setUseMockData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;

    try {
      if (!useMockData) {
        await axios.delete(`/api/users/${id}`);
      }
      toast.success('Utente eliminato con successo');
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'utente:', error);
      toast.error('Errore nell\'eliminazione dell\'utente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!useMockData) {
        await axios.put(`/api/users/${id}`, formData);
      }
      setUser(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      toast.success('Utente aggiornato con successo');
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'utente:', error);
      toast.error('Errore nell\'aggiornamento dell\'utente');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Utente non trovato</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>{user.name} | 7Sundays Academy</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <FiArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
              >
                <FiEdit2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300"
              >
                <FiTrash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {useMockData && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700">
                Attenzione: Stai utilizzando dati mockup perché l'API non è disponibile.
              </p>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Ruolo
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="student">Studente</option>
                      <option value="instructor">Istruttore</option>
                      <option value="admin">Amministratore</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition duration-300"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
                  >
                    Salva Modifiche
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Ruolo</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Amministratore' :
                         user.role === 'instructor' ? 'Istruttore' : 'Studente'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Data di Registrazione</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Corsi Iscritti</h3>
                    <p className="mt-1 text-sm text-gray-900">{user.enrolledCourses}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 