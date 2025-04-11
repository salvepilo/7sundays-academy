import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import axios from 'axios';

interface ApiConfig {
  id?: string;
  openaiApiKey: string;
  googleMapsApiKey: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  otherApiKeys: Record<string, string>;
}

export default function ApiSettings() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    openaiApiKey: '',
    googleMapsApiKey: '',
    stripeSecretKey: '',
    stripePublishableKey: '',
    otherApiKeys: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecretKeys, setShowSecretKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  // Reindirizza se l'utente non è autenticato o non è admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Carica la configurazione API
  useEffect(() => {
    const fetchApiConfig = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/settings/api');
        if (response.data && response.data.data) {
          setApiConfig(response.data.data);
        }
      } catch (err: any) {
        console.error('Errore nel caricamento della configurazione API:', err);
        setError(err.response?.data?.message || 'Errore nel caricamento della configurazione');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchApiConfig();
    }
  }, [isAuthenticated, isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('otherApiKeys.')) {
      const keyName = name.split('.')[1];
      setApiConfig(prev => ({
        ...prev,
        otherApiKeys: {
          ...prev.otherApiKeys,
          [keyName]: value
        }
      }));
    } else {
      setApiConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddNewKey = () => {
    if (!newKeyName || !newKeyValue) return;
    
    setApiConfig(prev => ({
      ...prev,
      otherApiKeys: {
        ...prev.otherApiKeys,
        [newKeyName]: newKeyValue
      }
    }));
    
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleRemoveKey = (keyName: string) => {
    setApiConfig(prev => {
      const updatedOtherKeys = { ...prev.otherApiKeys };
      delete updatedOtherKeys[keyName];
      
      return {
        ...prev,
        otherApiKeys: updatedOtherKeys
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post('/api/settings/api', apiConfig);
      
      if (response.data && response.data.status === 'success') {
        setSuccess('Configurazione API salvata con successo');
        // Aggiorna i dati con quelli restituiti dal server
        if (response.data.data) {
          setApiConfig(response.data.data);
        }
      }
    } catch (err: any) {
      console.error('Errore nel salvataggio della configurazione API:', err);
      setError(err.response?.data?.message || 'Errore nel salvataggio della configurazione');
    } finally {
      setIsSaving(false);
      
      // Nascondi il messaggio di successo dopo 3 secondi
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const toggleShowSecretKeys = () => {
    setShowSecretKeys(!showSecretKeys);
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
        <title>Configurazione API - Admin 7Sundays Academy</title>
        <meta name="description" content="Gestisci le chiavi API per la piattaforma 7Sundays Academy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">Configurazione API</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestisci le chiavi API per i servizi esterni utilizzati dalla piattaforma
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={toggleShowSecretKeys}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {showSecretKeys ? 'Nascondi chiavi' : 'Mostra chiavi'}
              </button>
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
                  <div className="grid grid-cols-1 gap-6">
                    {/* OpenAI API Key */}
                    <div>
                      <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700">
                        OpenAI API Key
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type={showSecretKeys ? 'text' : 'password'}
                          name="openaiApiKey"
                          id="openaiApiKey"
                          value={apiConfig.openaiApiKey}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="sk-..."
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Utilizzata per le funzionalità di intelligenza artificiale e generazione di contenuti
                      </p>
                    </div>

                    {/* Google Maps API Key */}
                    <div>
                      <label htmlFor="googleMapsApiKey" className="block text-sm font-medium text-gray-700">
                        Google Maps API Key
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type={showSecretKeys ? 'text' : 'password'}
                          name="googleMapsApiKey"
                          id="googleMapsApiKey"
                          value={apiConfig.googleMapsApiKey}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="AIza..."
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Utilizzata per le funzionalità di mappe e geolocalizzazione
                      </p>
                    </div>

                    {/* Stripe Secret Key */}
                    <div>
                      <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-700">
                        Stripe Secret Key
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type={showSecretKeys ? 'text' : 'password'}
                          name="stripeSecretKey"
                          id="stripeSecretKey"
                          value={apiConfig.stripeSecretKey}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="sk_live_..."
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Utilizzata per processare i pagamenti (lato server)
                      </p>
                    </div>

                    {/* Stripe Publishable Key */}
                    <div>
                      <label htmlFor="stripePublishableKey" className="block text-sm font-medium text-gray-700">
                        Stripe Publishable Key
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type={showSecretKeys ? 'text' : 'password'}
                          name="stripePublishableKey"
                          id="stripePublishableKey"
                          value={apiConfig.stripePublishableKey}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="pk_live_..."
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Utilizzata per processare i pagamenti (lato client)
                      </p>
                    </div>

                    {/* Altre chiavi API */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Altre chiavi API</h3>
                      
                      {Object.entries(apiConfig.otherApiKeys).map(([keyName, keyValue]) => (
                        <div key={keyName} className="flex items-center space-x-2 mb-2">
                          <div className="flex-grow">
                            <label htmlFor={`otherApiKeys.${keyName}`} className="block text-xs font-medium text-gray-500">
                              {keyName}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <input
                                type={showSecretKeys ? 'text' : 'password'}
                                name={`otherApiKeys.${keyName}`}
                                id={`otherApiKeys.${keyName}`}
                                value={keyValue}
                                onChange={handleInputChange}
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveKey(keyName)}
                            className="mt-6 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* Aggiungi nuova chiave */}
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="Nome chiave"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="text"
                            value={newKeyValue}
                            onChange={(e) => setNewKeyValue(e.target.value)}
                            placeholder="Valore chiave"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={handleAddNewKey}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Aggiungi
                          </button>
                        </div>
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