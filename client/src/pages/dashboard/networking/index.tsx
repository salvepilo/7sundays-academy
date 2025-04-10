import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import DashboardLayout from '@/components/layout/DashboardLayout';

// Tipi
interface Contact {
  id: string;
  name: string;
  position: string;
  company: string;
  avatar: string;
  email: string;
  phone?: string;
  linkedin?: string;
  industry: string;
  available: boolean;
}

interface UserStats {
  completedTests: number;
  averageScore: number;
  highestScore: number;
  hasAccess: boolean;
}

export default function Networking() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Carica i dati dell'utente e i contatti disponibili
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In una implementazione reale, questi dati verrebbero dal backend
        // Qui utilizziamo dati di esempio
        
        // Statistiche utente
        const mockStats: UserStats = {
          completedTests: 8,
          averageScore: 85,
          highestScore: 95,
          hasAccess: true, // Questo determina se l'utente ha accesso all'area networking
        };
        
        // Contatti professionali
        const mockContacts: Contact[] = [
          {
            id: '1',
            name: 'Marco Rossi',
            position: 'Senior Marketing Manager',
            company: 'Digital Solutions Inc.',
            avatar: '/images/avatars/contact1.jpg',
            email: 'marco.rossi@example.com',
            phone: '+39 123 456 7890',
            linkedin: 'https://linkedin.com/in/marcorossi',
            industry: 'Marketing',
            available: true
          },
          {
            id: '2',
            name: 'Laura Bianchi',
            position: 'UX/UI Designer',
            company: 'Creative Studio',
            avatar: '/images/avatars/contact2.jpg',
            email: 'laura.bianchi@example.com',
            linkedin: 'https://linkedin.com/in/laurabianchi',
            industry: 'Design',
            available: true
          },
          {
            id: '3',
            name: 'Alessandro Verdi',
            position: 'Full Stack Developer',
            company: 'Tech Innovations',
            avatar: '/images/avatars/contact3.jpg',
            email: 'alessandro.verdi@example.com',
            phone: '+39 345 678 9012',
            industry: 'Sviluppo',
            available: true
          },
          {
            id: '4',
            name: 'Giulia Neri',
            position: 'Project Manager',
            company: 'Global Projects',
            avatar: '/images/avatars/contact4.jpg',
            email: 'giulia.neri@example.com',
            linkedin: 'https://linkedin.com/in/giulianeri',
            industry: 'Management',
            available: true
          },
          {
            id: '5',
            name: 'Roberto Marini',
            position: 'SEO Specialist',
            company: 'Digital Growth',
            avatar: '/images/avatars/contact5.jpg',
            email: 'roberto.marini@example.com',
            phone: '+39 567 890 1234',
            linkedin: 'https://linkedin.com/in/robertomarini',
            industry: 'Marketing',
            available: false
          },
          {
            id: '6',
            name: 'Francesca Ricci',
            position: 'Content Creator',
            company: 'Media House',
            avatar: '/images/avatars/contact6.jpg',
            email: 'francesca.ricci@example.com',
            industry: 'Marketing',
            available: true
          },
        ];

        setStats(mockStats);
        setContacts(mockContacts);
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

  // Filtra i contatti in base all'industria selezionata e alla query di ricerca
  const filteredContacts = contacts.filter(contact => {
    const matchesIndustry = selectedIndustry === 'all' || contact.industry === selectedIndustry;
    const matchesSearch = searchQuery === '' || 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesIndustry && matchesSearch && contact.available;
  });

  // Estrai le industrie uniche per il filtro
  const industries = ['all', ...new Set(contacts.map(contact => contact.industry))];

  return (
    <DashboardLayout>
      <Head>
        <title>Area Networking | 7Sundays Academy</title>
        <meta name="description" content="Connettiti con professionisti del settore" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Area Networking</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : stats && stats.hasAccess ? (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Le tue statistiche</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100">Test completati</p>
                  <p className="text-2xl font-bold">{stats.completedTests}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100">Punteggio medio</p>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100">Punteggio più alto</p>
                  <p className="text-2xl font-bold">{stats.highestScore}%</p>
                </div>
              </div>
              <p className="mt-4 text-sm">
                Congratulazioni! Hai superato i test necessari per accedere all'area networking.
                Qui puoi connetterti con professionisti del settore che possono aiutarti nella tua carriera.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <h2 className="text-xl font-semibold">Contatti Professionali</h2>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cerca contatti..."
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
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry === 'all' ? 'Tutti i settori' : industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="p-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={contact.avatar} 
                            alt={contact.name} 
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{contact.name}</h3>
                            <p className="text-gray-600 text-sm">{contact.position}</p>
                            <p className="text-gray-500 text-sm">{contact.company}</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Email:</span> {contact.email}
                          </p>
                          {contact.phone && (
                            <p className="text-sm">
                              <span className="font-medium">Telefono:</span> {contact.phone}
                            </p>
                          )}
                          {contact.linkedin && (
                            <p className="text-sm">
                              <span className="font-medium">LinkedIn:</span> 
                              <a 
                                href={contact.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline ml-1"
                              >
                                Profilo
                              </a>
                            </p>
                          )}
                          <p className="text-sm">
                            <span className="font-medium">Settore:</span> {contact.industry}
                          </p>
                        </div>
                        <div className="mt-4">
                          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-300">
                            Contatta
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                  Nessun contatto trovato con i filtri selezionati. Prova a modificare i criteri di ricerca.
                </div>
              )}
            </div>
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
                Per accedere all'area networking devi completare almeno 5 test con un punteggio medio superiore all'80%.
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