import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

// Componenti
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  // Effetto per rilevare lo scroll e cambiare lo stile della navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // // Reindirizza gli utenti già autenticati alla dashboard
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     if (user?.role === 'admin') {
  //       router.push('/admin/dashboard');
  //     } else {
  //       router.push('/dashboard');
  //     }
  //   }
  // }, [isAuthenticated, router, user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>7Sundays Academy - Piattaforma di E-learning Professionale</title>
        <meta name="description" content="Piattaforma di e-learning per la gestione di corsi video con funzionalità avanzate di sicurezza, test e networking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar isScrolled={isScrolled} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl sm:text-5xl font-bold mb-6">Impara. Cresci. Connettiti.</h1>
                <p className="text-xl mb-8 text-primary-100">
                  Accedi a corsi video di alta qualità, metti alla prova le tue conoscenze e connettiti con professionisti del settore.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/register" className="btn-accent text-center">
                    Inizia Ora
                  </Link>
                  <Link href="/courses" className="btn bg-white text-primary-700 hover:bg-primary-50 text-center">
                    Esplora i Corsi
                  </Link>
                </div>
              </div>
              <div className="hidden md:block animate-slide-up">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-64 h-64 bg-secondary-500 rounded-full opacity-20 blur-2xl"></div>
                  <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-accent-500 rounded-full opacity-20 blur-3xl"></div>
                  <div className="relative bg-white p-2 rounded-lg shadow-2xl">
                    <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
                      {/* Placeholder per un'immagine o video di anteprima */}
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-primary-600 font-semibold">Video Anteprima</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Caratteristiche Principali</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                La nostra piattaforma offre tutto ciò di cui hai bisogno per un'esperienza di apprendimento completa e sicura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card card-hover">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Corsi Video Protetti</h3>
                <p className="text-gray-600">
                  Accedi a contenuti video di alta qualità con protezione avanzata contro la registrazione non autorizzata.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card card-hover">
                <div className="w-12 h-12 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Test con AI</h3>
                <p className="text-gray-600">
                  Metti alla prova le tue conoscenze con test intelligenti creati con l'aiuto dell'intelligenza artificiale.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card card-hover">
                <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Networking Professionale</h3>
                <p className="text-gray-600">
                  Connettiti con professionisti del settore e accedi a opportunità di lavoro esclusive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Come Funziona</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Un percorso semplice per migliorare le tue competenze e avanzare nella tua carriera.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Registrati</h3>
                <p className="text-gray-600">
                  Crea un account per accedere a tutti i corsi e le funzionalità della piattaforma.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Studia</h3>
                <p className="text-gray-600">
                  Accedi ai corsi video e studia a tuo ritmo, ovunque e in qualsiasi momento.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Supera i Test</h3>
                <p className="text-gray-600">
                  Metti alla prova le tue conoscenze con i test finali per ogni corso.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">4</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connettiti</h3>
                <p className="text-gray-600">
                  Accedi alle opportunità di networking e alle offerte di lavoro esclusive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary-600 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Pronto a Iniziare il Tuo Percorso?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Unisciti a migliaia di studenti che stanno già migliorando le loro competenze e avanzando nella loro carriera.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-accent">
                Registrati Ora
              </Link>
              <Link href="/courses" className="btn bg-white text-secondary-700 hover:bg-secondary-50">
                Esplora i Corsi
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}