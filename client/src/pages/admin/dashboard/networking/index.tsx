import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';

// Tipi
interface NetworkingContact {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  category: string;
  isActive: boolean;
  viewCount: number;
  contactCount: number;
  requirements: {
    minTestScore: number;
    requiredTests: string[];
    requiredCourses: string[];
  };
}

export default function AdminNetworking() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<NetworkingContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<NetworkingContact | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

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

  // Carica i contatti di networking
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // In una implementazione reale, questi dati verrebbero dal backend
        // Qui utilizziamo dati di esempio
        const mockContacts: NetworkingContact[] = [
          {
            id: '1',
            name: 'Marco Bianchi',
            position: 'Marketing Director',
            company: 'Digital Solutions',
            email: 'marco.bianchi@example.com',
            phone: '+39 123 456 7890',
            category: 'marketing',
            isActive: true,
            viewCount: 145,
            contactCount: 32,
            requirements: {
              minTestScore: 80,
              requiredTests: ['1'],
              requiredCourses: ['1'],
            },
          },
          {
            id: '2',
            name: 'Laura Verdi',
            position: 'SEO Specialist',
            company: 'Web Experts',
            email: 'laura.verdi@example.com',
            phone: '+39 234 567 8901',
            category: 'marketing',
            isActive: true,
            viewCount: 98,
            contactCount: 24,
            requirements: {
              minTestScore: 85,
              requiredTests: ['2'],
              requiredCourses: ['2'],
            },
          },
          {
            id: '3',
            name: 'Alessandro Rossi',
            position: 'Social Media Manager',
            company: 'Social Connect',
            email: 'alessandro.rossi@example.com',
            phone: '+39 345 678 9012',
            category: 'marketing',
            isActive: false,
            viewCount: 120,
            contactCount: 18,
            requirements: {
              minTestScore: 75,
              requiredTests: ['3'],
              requiredCourses: ['3'],
            },
          },
          {
            id: '4',
            name: 'Giulia Neri',
            position: 'Content Strategist',
            company: 'Content Hub',
            email: 'giulia.neri@example.com',
            phone: '+39 456 789 0123',
            category: 'marketing',
            isActive: true,
            viewCount: 85,
            contactCount: 15,
            requirements: {
              minTestScore: 70,
              requiredTests: ['4'],
              requiredCourses: ['4'],
            },
          },
          {
            id: '5',
            name: 'Roberto Marini',
            position: 'Web Developer',
            company: 'Tech Solutions',
            email: 'roberto.marini@example.com',
            phone: '+39 567 890 1234',
            category: 'development',
            isActive: true,
            viewCount: 110,
            contactCount: 22,
            requirements: {
              minTestScore: 90,
              requiredTests: ['2'],
              requiredCourses: ['2'],
            },
          },
        ];
        
        setContacts(mockContacts);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei contatti:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchContacts();
    }
  }, [isAuthenticated, user]);

  // Filtra i contatti in base ai criteri di ricerca
  const filteredContacts = contacts.filter(contact => {
    // Filtro per testo di ricerca
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro per categoria
    const matchesCategory = categoryFilter === 'all' || contact.category === categoryFilter;
    
    // Filtro per stato
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && contact.isActive) ||
                         (statusFilter === 'inactive' && !contact.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Gestisce l'apertura del modal per modificare un contatto
  const handleEditContact = (contact: NetworkingContact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  // Gestisce la creazione di un nuovo contatto
  const handleCreateContact = () => {
    setSelectedContact(null);
    setShowContactModal(true);
  };

  // Gestisce il toggle dello stato attivo/inattivo di un contatto
  const handleToggleStatus = (id: string) => {
    setContacts(contacts.map(contact => {
      if (contact.id === id) {
        return { ...contact, isActive: !contact.isActive };
      }
      return contact;
    }));
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestione Networking | 7Sundays Academy Admin</title>
      </Head>

      <div className="py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestione Contatti Networking</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestisci i contatti professionali disponibili per gli utenti che superano i test
            </p>
          </div>
          <button
            onClick={handleCreateContact}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuovo Contatto
          </button>
        </div>

        {/* Filtri */}
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Cerca</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Nome, azienda o email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tutte le categorie</option>
                <option value="marketing">Marketing</option>
                <option value="design">Design</option>
                <option value="development">Sviluppo</option>
                <option value="business">Business</option>
                <option value="other">Altro</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Stato</label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Attivo</option>
                <option value="inactive">Inattivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabella contatti */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {isLoading ? (
                  <div className="animate-pulse bg-white p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contatto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requisiti
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statistiche
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stato
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Azioni</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContacts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            Nessun contatto trovato
                          </td>
                        </tr>
                      ) : (
                        filteredContacts.map((contact) => (
                          <tr key={contact.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                  <span className="text-primary-600 font-medium">{contact.name.charAt(0)}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                  <div className="text-sm text-gray-500">{contact.email}</div>
                                  <div className="text-sm text-gray-500">{contact.position} - {contact.company}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>Punteggio minimo: {contact.requirements.minTestScore}%</div>
                              <div>Test richiesti: {contact.requirements.requiredTests.length}</div>
                              <div>Corsi richiesti: {contact.requirements.requiredCourses.length}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>Visualizzazioni: {contact.viewCount}</div>
                              <div>Contatti: {contact.contactCount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {contact.isActive ? 'Attivo' : 'Inattivo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditContact(contact)}
                                className="text-primary-600 hover:text-primary-900 mr-4"
                              >
                                Modifica
                              </button>
                              <button
                                onClick={() => handleToggleStatus(contact.id)}
                                className={`${contact.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                              >
                                {contact.isActive ? 'Disattiva' : 'Attiva'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal per creare/modificare contatto (in una implementazione reale) */}
      {/* Il modal verrebbe implementato qui */}
    </AdminLayout>
  );
}