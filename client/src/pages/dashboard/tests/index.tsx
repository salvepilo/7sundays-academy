import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import DashboardLayout from '@/components/layout/DashboardLayout';

// Tipi
interface Test {
  id: string;
  title: string;
  description: string;
  course: {
    id: string;
    title: string;
  };
  timeLimit: number;
  questionsCount: number;
  difficulty: 'facile' | 'medio' | 'difficile';
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  bestScore: number | null;
  hasPassed: boolean;
  isAvailable: boolean;
}

export default function Tests() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Carica i test disponibili dal backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        // Chiamata API al backend per ottenere i test disponibili
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
          course: {
            id: test.course._id,
            title: test.course.title
          },
          timeLimit: test.timeLimit,
          questionsCount: test.questions.length,
          difficulty: test.difficulty || 'medio', // Valore predefinito se non specificato
          passingScore: test.passingScore,
          attempts: test.userAttemptsCount || 0,
          maxAttempts: test.maxAttempts,
          bestScore: test.userBestScore > 0 ? test.userBestScore : null,
          hasPassed: test.userHasPassed || false,
          isAvailable: test.isPublished
        }));

        setTests(formattedTests);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei test:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchTests();
    }
  }, [isAuthenticated, user]);

  // Filtra i test in base ai criteri di ricerca
  const filteredTests = tests.filter(test => {
    const matchesSearch = searchQuery === '' || 
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === 'all' || test.difficulty === difficultyFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && test.bestScore !== null) ||
      (statusFilter === 'passed' && test.hasPassed) ||
      (statusFilter === 'failed' && test.bestScore !== null && !test.hasPassed) ||
      (statusFilter === 'not-attempted' && test.bestScore === null);
    
    return matchesSearch && matchesDifficulty && matchesStatus && test.isAvailable;
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Test | 7Sundays Academy</title>
        <meta name="description" content="Verifica le tue conoscenze con i nostri test" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Test Disponibili</h1>

        {/* Filtri */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Cerca</label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Cerca per titolo o corso..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficoltà</label>
              <select
                id="difficulty"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">Tutte le difficoltà</option>
                <option value="facile">Facile</option>
                <option value="medio">Medio</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select
                id="status"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                <option value="completed">Completati</option>
                <option value="passed">Superati</option>
                <option value="failed">Non superati</option>
                <option value="not-attempted">Non tentati</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div key={test.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      test.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                      test.difficulty === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{test.description}</p>
                  
                  <div className="text-sm text-gray-500 space-y-1 mb-4">
                    <p>Corso: {test.course.title}</p>
                    <p>Tempo: {test.timeLimit} minuti</p>
                    <p>Domande: {test.questionsCount}</p>
                    <p>Punteggio minimo: {test.passingScore}%</p>
                    <p>Tentativi: {test.attempts}/{test.maxAttempts}</p>
                  </div>
                  
                  {test.bestScore !== null && (
                    <div className={`mb-4 p-2 rounded-md ${
                      test.hasPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {test.hasPassed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={test.hasPassed ? 'text-green-700' : 'text-red-700'}>
                          Miglior punteggio: {test.bestScore}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    {test.attempts < test.maxAttempts ? (
                      <Link href={`/dashboard/tests/${test.id}`} className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-md transition duration-300">
                        {test.bestScore === null ? 'Inizia Test' : 'Riprova Test'}
                      </Link>
                    ) : test.hasPassed ? (
                      <div className="text-center text-green-600 font-medium">
                        Test superato con successo!
                      </div>
                    ) : (
                      <div className="text-center text-red-600 font-medium">
                        Tentativi massimi raggiunti
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
            Nessun test trovato con i filtri selezionati. Prova a modificare i criteri di ricerca.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}