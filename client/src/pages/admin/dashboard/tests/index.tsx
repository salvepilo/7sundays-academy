import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';

// Tipi
interface Test {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  questionsCount: number;
  difficulty: 'facile' | 'medio' | 'difficile';
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  completions: number;
  averageScore: number;
}

export default function AdminTests() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

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

  // Carica i test dal backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        // Chiamata API al backend per ottenere tutti i test (admin vede anche quelli non pubblicati)
        const response = await fetch('http://localhost:5001/api/tests', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Errore nella richiesta: ${response.status}`);
        }

        const data = await response.json();
        
        // Trasforma i dati ricevuti dal backend nel formato richiesto dal componente
        const formattedTests: Test[] = data.data.tests.map((test: any) => ({
          id: test._id,
          title: test.title,
          description: test.description,
          courseId: test.course._id,
          courseName: test.course.title,
          questionsCount: test.questions.length,
          difficulty: test.difficulty || 'medio', // Valore predefinito se non specificato
          createdAt: test.createdAt,
          updatedAt: test.updatedAt,
          status: test.isPublished ? 'published' : 'draft',
          completions: test.stats?.totalAttempts || 0,
          averageScore: test.stats?.averageScore || 0,
        }));

        setTests(formattedTests);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei test:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchTests();
    }
  }, [isAuthenticated, user]);

  // Filtra i test in base ai criteri di ricerca
  const filteredTests = tests.filter(test => {
    const matchesSearch = searchQuery === '' || 
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || test.difficulty === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  // Naviga alla pagina di creazione di un nuovo test
  const handleCreateTest = () => {
    router.push('/admin/dashboard/tests/create');
  };

  // Naviga alla pagina di modifica di un test esistente
  const handleEditTest = (testId: string) => {
    router.push(`/admin/dashboard/tests/${testId}/edit`);
  };

  // Naviga alla pagina di visualizzazione dei risultati di un test
  const handleViewResults = (testId: string) => {
    router.push(`/admin/dashboard/tests/${testId}/results`);
  };

  // Cambia lo stato di un test (pubblicato/bozza)
  const handleToggleStatus = async (testId: string, currentStatus: string) => {
    try {
      const isPublished = currentStatus === 'draft'; // Se è draft, lo pubblichiamo
      
      // Chiamata API al backend per cambiare lo stato del test
      const response = await fetch(`http://localhost:5001/api/tests/${testId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublished })
      });

      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }

      const data = await response.json();
      
      // Aggiorna lo stato locale dopo la risposta del server
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId ? { ...test, status: newStatus as 'draft' | 'published' } : test
        )
      );
    } catch (error) {
      console.error('Errore nel cambio di stato del test:', error);
      alert('Si è verificato un errore durante il cambio di stato del test. Riprova più tardi.');
    }
  };

  // Elimina un test
  const handleDeleteTest = async (testId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo test? Questa azione non può essere annullata.')) {
      try {
        // Chiamata API al backend per eliminare il test
        const response = await fetch(`http://localhost:5001/api/tests/${testId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Errore nella richiesta: ${response.status}`);
        }
        
        // Aggiorna lo stato locale dopo la risposta del server
        setTests(prevTests => prevTests.filter(test => test.id !== testId));
      } catch (error) {
        console.error('Errore nell\'eliminazione del test:', error);
        alert('Si è verificato un errore durante l\'eliminazione del test. Riprova più tardi.');
      }
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestione Test | Admin 7Sundays Academy</title>
        <meta name="description" content="Gestione dei test per la piattaforma 7Sundays Academy" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestione Test</h1>
          <button
            onClick={handleCreateTest}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Crea Nuovo Test
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            <h2 className="text-xl font-semibold">Filtri</h2>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cerca test..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                <option value="published">Pubblicati</option>
                <option value="draft">Bozze</option>
              </select>
              <select
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">Tutte le difficoltà</option>
                <option value="facile">Facile</option>
                <option value="medio">Medio</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corso
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficoltà
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domande
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completamenti
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Punteggio Medio
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{test.title}</div>
                            <div className="text-sm text-gray-500">{test.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{test.courseName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${test.difficulty === 'facile' ? 'bg-green-100 text-green-800' : 
                            test.difficulty === 'medio' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {test.questionsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${test.status === 'published' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {test.status === 'published' ? 'Pubblicato' : 'Bozza'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {test.completions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {test.status === 'published' && test.completions > 0 ? (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">{test.averageScore}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${test.averageScore >= 80 ? 'bg-green-500' : 
                                  test.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${test.averageScore}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditTest(test.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Modifica"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          {test.status === 'published' && test.completions > 0 && (
                            <button
                              onClick={() => handleViewResults(test.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Visualizza risultati"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v12.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(test.id, test.status)}
                            className={`${test.status === 'published' ? 'text-orange-600 hover:text-orange-900' : 'text-blue-600 hover:text-blue-900'}`}
                            title={test.status === 'published' ? 'Imposta come bozza' : 'Pubblica'}
                          >
                            {test.status === 'published' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm-6 8v4h6v-4H7z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Elimina"
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
              Nessun test trovato con i filtri selezionati. Prova a modificare i criteri di ricerca o crea un nuovo test.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}