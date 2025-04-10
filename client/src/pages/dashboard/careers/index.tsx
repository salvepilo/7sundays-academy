import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import DashboardLayout from '@/components/layout/DashboardLayout';

// Tipi
interface JobPosition {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // full-time, part-time, freelance, etc.
  description: string;
  requirements: string[];
  salary?: string;
  contactEmail: string;
  postedAt: string;
  deadline?: string;
}

interface UserStats {
  completedTests: number;
  perfectScores: number;
  hasAccess: boolean;
}

export default function Careers() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeFile: null as File | null,
  });

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Carica i dati dell'utente e le posizioni lavorative disponibili
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In una implementazione reale, questi dati verrebbero dal backend
        // Qui utilizziamo dati di esempio
        
        // Statistiche utente
        const mockStats: UserStats = {
          completedTests: 10,
          perfectScores: 3,
          hasAccess: true, // Questo determina se l'utente ha accesso all'area "Lavora con noi"
        };
        
        // Posizioni lavorative
        const mockPositions: JobPosition[] = [
          {
            id: '1',
            title: 'Web Developer Senior',
            company: '7Sundays Tech',
            location: 'Milano, Italia (Remoto)',
            type: 'Full-time',
            description: 'Stiamo cercando un Web Developer Senior con esperienza in React e Next.js per unirsi al nostro team di sviluppo. Il candidato ideale avrà una solida esperienza nello sviluppo di applicazioni web moderne e scalabili.',
            requirements: [
              'Almeno 3 anni di esperienza con React',
              'Esperienza con Next.js e TypeScript',
              'Conoscenza di GraphQL e REST API',
              'Esperienza con sistemi di controllo versione (Git)',
              'Capacità di lavorare in team e comunicare efficacemente',
            ],
            salary: '€45,000 - €60,000',
            contactEmail: 'careers@7sundays.com',
            postedAt: '2023-09-15',
            deadline: '2023-10-30',
          },
          {
            id: '2',
            title: 'UX/UI Designer',
            company: '7Sundays Creative',
            location: 'Roma, Italia',
            type: 'Part-time',
            description: 'Cerchiamo un UX/UI Designer creativo e orientato ai dettagli per progettare interfacce utente intuitive e accattivanti per le nostre applicazioni web e mobile.',
            requirements: [
              'Portfolio di progetti UX/UI',
              'Esperienza con Figma o Adobe XD',
              'Conoscenza dei principi di design responsivo',
              'Capacità di condurre test di usabilità',
              'Buona comprensione delle best practice di accessibilità',
            ],
            contactEmail: 'design@7sundays.com',
            postedAt: '2023-09-20',
          },
          {
            id: '3',
            title: 'Content Creator',
            company: '7Sundays Media',
            location: 'Remoto',
            type: 'Freelance',
            description: 'Stiamo cercando content creator per produrre contenuti educativi di alta qualità per la nostra piattaforma di e-learning. I candidati devono avere esperienza nella creazione di contenuti didattici coinvolgenti.',
            requirements: [
              'Eccellenti capacità di scrittura e comunicazione',
              'Esperienza nella creazione di contenuti educativi',
              'Conoscenza di strumenti di editing video e audio',
              'Capacità di spiegare concetti complessi in modo semplice',
              'Preferibile esperienza nel settore tech o marketing',
            ],
            salary: 'A progetto',
            contactEmail: 'content@7sundays.com',
            postedAt: '2023-09-25',
            deadline: '2023-11-15',
          },
          {
            id: '4',
            title: 'Marketing Specialist',
            company: '7Sundays Academy',
            location: 'Milano, Italia',
            type: 'Full-time',
            description: 'Cerchiamo un Marketing Specialist per sviluppare e implementare strategie di marketing per la nostra piattaforma di e-learning. Il candidato ideale avrà esperienza nel marketing digitale e nella gestione di campagne pubblicitarie.',
            requirements: [
              'Almeno 2 anni di esperienza nel marketing digitale',
              'Conoscenza di SEO, SEM e social media marketing',
              'Esperienza con strumenti di analytics e reporting',
              'Capacità di sviluppare e gestire campagne pubblicitarie',
              'Buone capacità analitiche e di problem solving',
            ],
            salary: '€35,000 - €45,000',
            contactEmail: 'marketing@7sundays.com',
            postedAt: '2023-09-10',
            deadline: '2023-10-25',
          },
        ];

        setStats(mockStats);
        setPositions(mockPositions);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  // Filtra le posizioni in base al tipo selezionato e alla query di ricerca
  const filteredPositions = positions.filter(position => {
    const matchesType = selectedType === 'all' || position.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Estrai i tipi di lavoro unici per il filtro
  const jobTypes = ['all', ...new Set(positions.map(position => position.type))];

  // Gestisce l'apertura del form di candidatura
  const handleApply = (position: JobPosition) => {
    setSelectedPosition(position);
    setShowApplicationForm(true);
    // Precompila i dati dell'utente se disponibili
    if (user) {
      setApplicationData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  };

  // Gestisce l'invio della candidatura
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Qui andrebbe la logica per inviare la candidatura tramite API
      console.log('Invio candidatura:', {
        position: selectedPosition,
        application: applicationData,
      });
      
      // Simuliamo un ritardo per l'invio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowApplicationForm(false);
      setSelectedPosition(null);
      setApplicationData({
        name: '',
        email: '',
        phone: '',
        coverLetter: '',
        resumeFile: null,
      });
      setIsLoading(false);
      
      // Mostra un messaggio di successo
      alert('Candidatura inviata con successo! Ti contatteremo presto.');
    } catch (error) {
      console.error('Errore nell\'invio della candidatura:', error);
      setIsLoading(false);
      alert('Si è verificato un errore durante l\'invio della candidatura. Riprova più tardi.');
    }
  };

  // Gestisce il caricamento del file CV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApplicationData(prev => ({
        ...prev,
        resumeFile: e.target.files![0],
      }));
    }
  };

  // Gestisce i cambiamenti nei campi del form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Lavora con Noi | 7Sundays Academy</title>
        <meta name="description" content="Opportunità di lavoro esclusive per gli studenti di 7Sundays Academy" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Lavora con Noi</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : stats && stats.hasAccess ? (
          <>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Area Esclusiva</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-green-100">Test completati</p>
                  <p className="text-2xl font-bold">{stats.completedTests}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-green-100">Punteggi perfetti (100%)</p>
                  <p className="text-2xl font-bold">{stats.perfectScores}</p>
                </div>
              </div>
              <p className="mt-4 text-sm">
                Congratulazioni! Hai ottenuto punteggi perfetti nei test e hai accesso alle opportunità di lavoro esclusive.
                Queste posizioni sono riservate ai migliori studenti della nostra piattaforma.
              </p>
            </div>

            {!showApplicationForm ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                  <h2 className="text-xl font-semibold">Posizioni Aperte</h2>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cerca posizioni..."
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <select
                      className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'Tutti i tipi' : type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredPositions.length > 0 ? (
                  <div className="space-y-6">
                    {filteredPositions.map((position) => (
                      <div key={position.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="font-semibold text-xl text-gray-800">{position.title}</h3>
                            <p className="text-gray-600 mt-1">{position.company} • {position.location}</p>
                            <div className="mt-2">
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {position.type}
                              </span>
                              {position.salary && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                                  {position.salary}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <p className="text-sm text-gray-500 mb-2">
                              Pubblicato il {new Date(position.postedAt).toLocaleDateString('it-IT')}
                            </p>
                            {position.deadline && (
                              <p className="text-sm text-gray-500">
                                Scadenza: {new Date(position.deadline).toLocaleDateString('it-IT')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-gray-700">{position.description}</p>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-800 mb-2">Requisiti:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {position.requirements.map((req, index) => (
                              <li key={index} className="text-gray-700">{req}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <button 
                            onClick={() => handleApply(position)}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition duration-300"
                          >
                            Candidati
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                    Nessuna posizione trovata con i filtri selezionati. Prova a modificare i criteri di ricerca.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Candidatura per {selectedPosition?.title}</h2>
                  <button 
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={applicationData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={applicationData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={applicationData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 mb-1">Curriculum Vitae (PDF)</label>
                      <input
                        type="file"
                        id="resumeFile"
                        name="resumeFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">Lettera di Presentazione</label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      rows={6}
                      value={applicationData.coverLetter}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      required
                      placeholder="Descrivi brevemente perché sei interessato a questa posizione e quali sono le tue competenze rilevanti..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition duration-300"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Invio in corso...' : 'Invia Candidatura'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="bg-yellow-50 inline-block p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Accesso non disponibile</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Per accedere all'area "Lavora con Noi" devi ottenere il 100% in almeno un test.
                Questa sezione è riservata agli studenti che dimostrano un'eccellente padronanza degli argomenti.
              </p>
              <button 
                onClick={() => router.push('/dashboard/tests')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-300"
              >
                Vai ai Test
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}