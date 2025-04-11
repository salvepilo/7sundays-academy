import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import axios from 'axios';

interface EmailConfig {
  id?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  senderEmail: string;
  senderName: string;
  emailTemplates: {
    welcome: string;
    resetPassword: string;
    courseEnrollment: string;
    courseCompletion: string;
    newLesson: string;
  };
}

export default function EmailSettings() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: '',
    smtpPassword: '',
    senderEmail: '',
    senderName: '7Sundays Academy',
    emailTemplates: {
      welcome: 'Benvenuto su 7Sundays Academy!\n\nGrazie per esserti registrato alla nostra piattaforma. Siamo felici di averti con noi.\n\nCordiali saluti,\nIl team di 7Sundays Academy',
      resetPassword: 'Hai richiesto il reset della password.\n\nClicca sul seguente link per reimpostare la tua password: {{resetLink}}\n\nSe non hai richiesto il reset della password, ignora questa email.\n\nCordiali saluti,\nIl team di 7Sundays Academy',
      courseEnrollment: 'Congratulazioni per l\'iscrizione al corso "{{courseName}}"!\n\nPuoi iniziare subito ad apprendere accedendo alla piattaforma.\n\nBuono studio!\nIl team di 7Sundays Academy',
      courseCompletion: 'Congratulazioni per aver completato il corso "{{courseName}}"!\n\nPuoi scaricare il tuo certificato dalla piattaforma.\n\nContinua così!\nIl team di 7Sundays Academy',
      newLesson: 'È disponibile una nuova lezione nel corso "{{courseName}}"!\n\nAccedi alla piattaforma per iniziare subito.\n\nBuono studio!\nIl team di 7Sundays Academy'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Reindirizza se l'utente non è autenticato o non è admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Carica la configurazione email
  useEffect(() => {
    const fetchEmailConfig = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/settings/email');
        if (response.data && response.data.data) {
          setEmailConfig(response.data.data);
        }
      } catch (err: any) {
        console.error('Errore nel caricamento della configurazione email:', err);
        setError(err.response?.data?.message || 'Errore nel caricamento della configurazione');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchEmailConfig();
    }
  }, [isAuthenticated, isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEmailConfig(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setEmailConfig(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else if (name.startsWith('emailTemplates.')) {
      const templateName = name.split('.')[1];
      setEmailConfig(prev => ({
        ...prev,
        emailTemplates: {
          ...prev.emailTemplates,
          [templateName]: value
        }
      }));
    } else {
      setEmailConfig(prev => ({
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
      
      const response = await axios.post('/api/settings/email', emailConfig);
      
      if (response.data && response.data.status === 'success') {
        setSuccess('Configurazione email salvata con successo');
        if (response.data.data) {
          setEmailConfig(response.data.data);
        }
      }
    } catch (err: any) {
      console.error('Errore nel salvataggio della configurazione email:', err);
      setError(err.response?.data?.message || 'Errore nel salvataggio della configurazione');
    } finally {
      setIsSaving(false);
      
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testEmailAddress) {
      setError('Inserisci un indirizzo email per il test');
      return;
    }

    try {
      setIsSendingTest(true);
      setError(null);
      
      const response = await axios.post('/api/settings/email/test', {
        email: testEmailAddress
      });
      
      if (response.data && response.data.status === 'success') {
        setSuccess('Email di test inviata con successo');
        setTestEmailAddress('');
      }
    } catch (err: any) {
      console.error('Errore nell\'invio dell\'email di test:', err);
      setError(err.response?.data?.message || 'Errore nell\'invio dell\'email di test');
    } finally {
      setIsSendingTest(false);
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
        <title>Configurazione Email - Admin 7Sundays Academy</title>
        <meta name="description" content="Gestisci le impostazioni email della piattaforma" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">Configurazione Email</h1>
              <p className="mt-1 text-sm text-gray-500">
                Configura le impostazioni SMTP e i template delle email
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
                  <div className="grid grid-cols-1 gap-6">
                    {/* Configurazione SMTP */}
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Configurazione SMTP</h3>
                      <p className="mt-1 text-sm text-gray-500">Configura le impostazioni del server SMTP per l'invio delle email.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                          Host SMTP
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="smtpHost"
                            id="smtpHost"
                            value={emailConfig.smtpHost}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="smtp.example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                          Porta SMTP
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="smtpPort"
                            id="smtpPort"
                            value={emailConfig.smtpPort}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700">
                          Username SMTP
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="smtpUser"
                            id="smtpUser"
                            value={emailConfig.smtpUser}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
                          Password SMTP
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="smtpPassword"
                            id="smtpPassword"
                            value={emailConfig.smtpPassword}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="smtpSecure"
                          name="smtpSecure"
                          type="checkbox"
                          checked={emailConfig.smtpSecure}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="smtpSecure" className="font-medium text-gray-700">Usa connessione sicura</label>
                        <p className="text-gray-500">Utilizza TLS/SSL per la connessione SMTP</p>
                      </div>
                    </div>

                    {/* Configurazione Mittente */}
                    <div className="pt-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Configurazione Mittente</h3>
                      <p className="mt-1 text-sm text-gray-500">Imposta le informazioni del mittente per le email inviate.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700">
                          Email Mittente
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="senderEmail"
                            id="senderEmail"
                            value={emailConfig.senderEmail}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">
                          Nome Mittente
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="senderName"
                            id="senderName"
                            value={emailConfig.senderName}
                            onChange={handleInputChange}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Template Email */}
                    <div className="pt-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Template Email</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Personalizza i template delle email. Usa {{variabile}} per i segnaposto.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="emailTemplates.welcome" className="block text-sm font-medium text-gray-700">
                        Email di Benvenuto
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="emailTemplates.welcome"
                          id="emailTemplates.welcome"
                          rows={4}
                          value={emailConfig.emailTemplates.welcome}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="emailTemplates.resetPassword" className="block text-sm font-medium text-gray-700">
                        Reset Password
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="emailTemplates.resetPassword"
                          id="emailTemplates.resetPassword"
                          rows={4}
                          value={emailConfig.emailTemplates.resetPassword}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Variabili disponibili: {{resetLink}}</p>
                    </div>

                    <div>
                      <label htmlFor="emailTemplates.courseEnrollment" className="block text-sm font-medium text-gray-700">
                        Iscrizione al Corso
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="emailTemplates.courseEnrollment"
                          id="emailTemplates.courseEnrollment"
                          rows={4}
                          value={emailConfig.emailTemplates.courseEnrollment}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Variabili disponibili: {{courseName}}</p>
                    </div>

                    <div>
                      <label htmlFor="emailTemplates.courseCompletion" className="block text-sm font-medium text-gray-700">
                        Completamento Corso
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="emailTemplates.courseCompletion"
                          id="emailTemplates.courseCompletion"
                          rows={4}
                          value={emailConfig.emailTemplates.courseCompletion}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Variabili disponibili: {{courseName}}</p>
                    </div>

                    <div>
                      <label htmlFor="emailTemplates.newLesson" className="block text-sm font-medium text-gray-700">
                        Nuova Lezione
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="emailTemplates.newLesson"
                          id="emailTemplates.newLesson"
                          rows={4}
                          value={emailConfig.emailTemplates.newLesson}
                          onChange={handleInputChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Variabili disponibili: {{courseName}}</p>
                    </div>

                    {/* Test Email */}
                    <div className="pt-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Test Email</h3>
                      <p className="mt-1 text-sm text-gray-500">Invia un'email di test per verificare la configurazione.</p>

                      <div className="mt-4 flex items-end space-x-4">
                        <div className="flex-grow">
                          <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700">
                            Indirizzo Email di Test
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              id="testEmail"
                              value={testEmailAddress}
                              onChange={(e) => setTestEmailAddress(e.target.value)}
                              className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="test@example.com"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleTestEmail}
                          disabled={isSendingTest || !testEmailAddress}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingTest ? 'Invio...' : 'Invia Test'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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