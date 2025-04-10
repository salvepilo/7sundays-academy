import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import DashboardLayout from '@/components/layout/DashboardLayout';

// Tipi
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  completedCourses: number;
  completedTests: number;
  averageScore: number;
  joinedAt: string;
}

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Carica i dati del profilo utente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // In una implementazione reale, questi dati verrebbero dal backend
        // Qui utilizziamo dati di esempio
        const mockProfile: UserProfile = {
          id: '1',
          name: user?.name || 'Utente',
          email: user?.email || 'utente@example.com',
          avatar: user?.avatar || '/images/avatars/default.jpg',
          role: user?.role || 'student',
          completedCourses: 3,
          completedTests: 8,
          averageScore: 85,
          joinedAt: '2023-01-15',
        };

        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          email: mockProfile.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento del profilo:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Qui andrebbe la logica per aggiornare il profilo tramite API
      console.log('Aggiornamento profilo:', formData);
      
      // Simuliamo un ritardo per l'aggiornamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aggiorniamo il profilo locale
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          email: formData.email,
        });
      }
      
      setIsEditing(false);
      setIsLoading(false);
      
      // Mostra un messaggio di successo
      alert('Profilo aggiornato con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiornamento del profilo:', error);
      setIsLoading(false);
      alert('Si è verificato un errore durante l\'aggiornamento del profilo.');
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Profilo Utente | 7Sundays Academy</title>
        <meta name="description" content="Gestisci il tuo profilo su 7Sundays Academy" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Il Tuo Profilo</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : profile ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={profile.avatar || '/images/avatars/default.jpg'} 
                    alt={profile.name} 
                    className="h-24 w-24 rounded-full border-4 border-white object-cover"
                  />
                  {!isEditing && (
                    <button 
                      className="absolute bottom-0 right-0 bg-white text-blue-500 rounded-full p-1 shadow-md hover:bg-gray-100"
                      title="Cambia avatar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-blue-100">{profile.email}</p>
                  <p className="text-blue-100 mt-1">Membro dal {new Date(profile.joinedAt).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Statistiche</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Corsi completati:</span>
                          <span className="font-medium">{profile.completedCourses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Test completati:</span>
                          <span className="font-medium">{profile.completedTests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Punteggio medio:</span>
                          <span className="font-medium">{profile.averageScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Informazioni Account</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nome:</span>
                          <span className="font-medium">{profile.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{profile.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ruolo:</span>
                          <span className="font-medium capitalize">{profile.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                    >
                      Modifica Profilo
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h3 className="text-lg font-medium text-gray-700 mb-3">Cambia Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Password Attuale</label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Conferma Nuova Password</label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition duration-300"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Impossibile caricare i dati del profilo. Riprova più tardi.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}