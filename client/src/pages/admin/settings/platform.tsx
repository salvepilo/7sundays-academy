import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import axios from 'axios';

interface PlatformConfig {
  id?: string;
  platformName: string;
  platformDescription: string;
  primaryColor: string;
  secondaryColor: string;
  maxUsersPerCourse: number;
  maxCoursesPerUser: number;
  enableUserRegistration: boolean;
  enablePublicCourses: boolean;
  maintenanceMode: boolean;
  contactEmail: string;
  supportEmail: string;
  footerText: string;
  termsUrl: string;
  privacyUrl: string;
  logoUrl: string;
  faviconUrl: string;
}

export default function PlatformSettings() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    platformName: '7Sundays Academy',
    platformDescription: 'Piattaforma di formazione online',
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    maxUsersPerCourse: 100,
    maxCoursesPerUser: 10,
    enableUserRegistration: true,
    enablePublicCourses: true,
    maintenanceMode: false,
    contactEmail: 'contact@7sundays.com',
    supportEmail: 'support@7sundays.com',
    footerText: '© 2023 7Sundays Academy. Tutti i diritti riservati.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    logoUrl: '/images/logo.png',
    faviconUrl: '/favicon.ico'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reindirizza se l'utente non è autenticato o non è admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Carica la configurazione della piattaforma
  useEffect(() => {
    const fetchPlatformConfig = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/settings/platform');
        if (response.data && response.data.data) {
          setPlatformConfig(response.data.data);
        }
      } catch (err: any) {
        console.error('Errore nel caricamento della configurazione della piattaforma:', err);
        setError(err.response?.data?.message || 'Errore nel caricamento della configurazione');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchPlatformConfig();
    }
  }, [isAuthenticated, isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPlatformConfig(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setPlatformConfig(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setPlatformConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post('/api/settings/platform', platformConfig);
      
      if (response.data && response.data.status === 'success') {
        setSuccess('Configurazione della piattaforma salvata con successo');
        // Aggiorna i dati con quelli restituiti dal server
        if (response.data.data) {
          setPlatformConfig(response.data.data);
        }
      }
    } catch (err: any) {
      console.error('Errore nel salvataggio della configurazione della piattaforma:', err);
      setError(err.response?.data?.message || 'Errore nel salvataggio della configurazione');
    } finally {
      setIsSaving(false);
      
      // Nascondi il messaggio di successo dopo 3 secondi
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Impostazioni Piattaforma - Admin 7Sundays Academy</title>
        <meta name="description" content="Gestisci le impostazioni generali della piattaforma 7Sundays Academy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">Impostazioni Piattaforma</h1>
              <p className="mt-1 text-sm text-gray-500">
                Configura le impostazioni generali della piattaforma
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Informazioni di base */}
                    <div className="col-span-2">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Informazioni di base</h3>
                      <p className="mt-1 text-sm text-gray-500">Configura le informazioni principali della piattaforma.</p>
                    </div>

                    <div>
                      <label htmlFor="platformName" className="block text-sm font-medium text-gray-700">
                        Nome Piattaforma
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="platformName"
                          id="platformName"
                          value={platformConfig.platformName}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="platformDescription" className="block text-sm font-medium text-gray-700">
                        Descrizione Piattaforma
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="platformDescription"
                          id="platformDescription"
                          value={platformConfig.platformDescription}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                        Email di Contatto
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="contactEmail"
                          id="contactEmail"
                          value={platformConfig.contactEmail}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
                        Email di Supporto
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="supportEmail"
                          id="supportEmail"
                          value={platformConfig.supportEmail}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Aspetto */}
                    <div className="col-span-2 mt-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Aspetto</h3>
                      <p className="mt-1 text-sm text-gray-500">Personalizza l'aspetto visivo della piattaforma.</p>
                    </div>

                    <div>
                      <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                        Colore Primario
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="color"
                          name="primaryColor"
                          id="primaryColor"
                          value={platformConfig.primaryColor}
                          onChange={handleInputChange}
                          className="h-8 w-8 rounded-md border border-gray-300 mr-2"
                        />
                        <input
                          type="text"
                          name="primaryColor"
                          value={platformConfig.primaryColor}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                        Colore Secondario
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="color"
                          name="secondaryColor"
                          id="secondaryColor"
                          value={platformConfig.secondaryColor}
                          onChange={handleInputChange}
                          className="h-8 w-8 rounded-md border border-gray-300 mr-2"
                        />
                        <input
                          type="text"
                          name="secondaryColor"
                          value={platformConfig.secondaryColor}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                        URL Logo
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="logoUrl"
                          id="logoUrl"
                          value={platformConfig.logoUrl}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700">
                        URL Favicon
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="faviconUrl"
                          id="faviconUrl"
                          value={platformConfig.faviconUrl}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Limiti e Funzionalità */}
                    <div className="col-span-2 mt-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Limiti e Funzionalità</h3>
                      <p className="mt-1 text-sm text-gray-500">Configura i limiti e le funzionalità della piattaforma.</p>
                    </div>

                    <div>
                      <label htmlFor="maxUsersPerCourse" className="block text-sm font-medium text-gray-700">
                        Utenti massimi per corso
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="maxUsersPerCourse"
                          id="maxUsersPerCourse"
                          min="1"
                          value={platformConfig.maxUsersPerCourse}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="maxCoursesPerUser" className="block text-sm font-medium text-gray-700">
                        Corsi massimi per utente
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="maxCoursesPerUser"
                          id="maxCoursesPerUser"
                          min="1"
                          value={platformConfig.maxCoursesPerUser}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 mt-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enableUserRegistration"
                            name="enableUserRegistration"
                            type="checkbox"
                            checked={platformConfig.enableUserRegistration}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enableUserRegistration" className="font-medium text-gray-700">Abilita registrazione utenti</label>
                          <p className="text-gray-500">Consenti ai nuovi utenti di registrarsi alla piattaforma</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enablePublicCourses"
                            name="enablePublicCourses"
                            type="checkbox"
                            checked={platformConfig.enablePublicCourses}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enablePublicCourses" className="font-medium text-gray-700">Abilita corsi pubblici</label>
                          <p className="text-gray-500">Consenti la visualizzazione dei corsi senza autenticazione</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="maintenanceMode"
                            name="maintenanceMode"
                            type="checkbox"
                            checked={platformConfig.maintenanceMode}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="maintenanceMode" className="font-medium text-gray-700">Modalità manutenzione</label>
                          <p className="text-gray-500">Attiva la modalità manutenzione (solo gli amministratori potranno accedere)</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer e Link legali */}
                    <div className="col-span-2 mt-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Footer e Link legali</h3>
                      <p className="mt-1 text-sm text-gray-500">Configura il testo del footer e i link ai documenti legali.</p>
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="footerText" className="block text-sm font-medium text-gray-700">
                        Testo Footer
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="footerText"
                          id="footerText"
                          value={platformConfig.footerText}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="termsUrl" className="block text-sm font-medium text-gray-700">
                        URL Termini e Condizioni
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="termsUrl"
                          id="termsUrl"
                          value={platformConfig.termsUrl}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="privacyUrl" className="block text-sm font-medium text-gray-700">
                        URL Privacy Policy
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="privacyUrl"
                          id="privacyUrl"
                          value={platformConfig.privacyUrl}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSaving ? 'Salvataggio...' : 'Salva configurazione'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}