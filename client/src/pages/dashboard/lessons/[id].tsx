import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Componenti
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Tipi
interface Resource {
  title: string;
  type: 'pdf' | 'link' | 'file';
  url: string;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  formattedDuration: string;
  order: number;
  course: {
    _id: string;
    title: string;
  };
  resources: Resource[];
  transcript: string;
  protection: {
    watermark: {
      enabled: boolean;
      text: string;
    };
    downloadDisabled: boolean;
    screenRecordingProtection: boolean;
  };
  nextLesson?: {
    _id: string;
    title: string;
  };
  prevLesson?: {
    _id: string;
    title: string;
  };
}

export default function LessonDetail() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [updateProgressInterval, setUpdateProgressInterval] = useState<NodeJS.Timeout | null>(null);

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push(`/auth/login?redirect=/lessons/${id}`);
    }
  }, [isAuthenticated, isLoading, router, id]);

  // Carica i dettagli della lezione
  useEffect(() => {
    const fetchLessonDetails = async () => {
      if (!id || !isAuthenticated) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`/api/lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setLesson(response.data.data.lesson);
        
        // Ottieni il token per il video protetto
        const tokenResponse = await axios.get(`/api/lessons/${id}/video-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setVideoToken(tokenResponse.data.token);
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento della lezione:', error);
        setIsLoading(false);
        setError('Impossibile caricare la lezione. Verifica di essere iscritto al corso.');
        
        // Dati di esempio in caso di errore
        const mockLesson: Lesson = {
          _id: id as string,
          title: 'Introduzione al Marketing Digitale',
          description: 'In questa lezione introduttiva, esploreremo i concetti fondamentali del marketing digitale e come si è evoluto negli ultimi anni.',
          videoUrl: 'https://example.com/protected-video.mp4',
          duration: 1200, // 20 minuti in secondi
          formattedDuration: '00:20:00',
          order: 1,
          course: {
            _id: 'c1',
            title: 'Marketing Digitale Completo'
          },
          resources: [
            {
              title: 'Slide della lezione',
              type: 'pdf',
              url: '/resources/slides-marketing-intro.pdf'
            },
            {
              title: 'Articolo di approfondimento',
              type: 'link',
              url: 'https://example.com/articolo-marketing'
            }
          ],
          transcript: 'Benvenuti alla prima lezione del corso di Marketing Digitale. Oggi parleremo dei concetti fondamentali che ogni marketer dovrebbe conoscere...',
          protection: {
            watermark: {
              enabled: true,
              text: '7Sundays Academy - ' + (user?.email || '')
            },
            downloadDisabled: true,
            screenRecordingProtection: true
          },
          nextLesson: {
            _id: 'l2',
            title: 'Strategie di Content Marketing'
          }
        };
        
        setLesson(mockLesson);
      }
    };

    if (id && isAuthenticated) {
      fetchLessonDetails();
    }
  }, [id, isAuthenticated, user]);

  // Gestisce l'aggiornamento del progresso
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      // Aggiorna il progresso ogni 10 secondi
      const interval = setInterval(async () => {
        if (videoRef.current) {
          const currentTime = Math.floor(videoRef.current.currentTime);
          setCurrentTime(currentTime);
          
          try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/lessons/${id}/watch`, {
              timestamp: currentTime,
              duration: lesson?.duration || 0
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (error) {
            console.error('Errore nell\'aggiornamento del progresso:', error);
          }
        }
      }, 10000); // 10 secondi
      
      setUpdateProgressInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else if (updateProgressInterval) {
      clearInterval(updateProgressInterval);
      setUpdateProgressInterval(null);
    }
  }, [isPlaying, id, lesson]);

  // Gestisce la riproduzione del video
  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    
    // Aggiorna il progresso quando il video viene messo in pausa
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      setCurrentTime(currentTime);
      
      try {
        const token = localStorage.getItem('token');
        axios.patch(`/api/lessons/${id}/watch`, {
          timestamp: currentTime,
          duration: lesson?.duration || 0
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Errore nell\'aggiornamento del progresso:', error);
      }
    }
  };

  // Gestisce il completamento del video
  const handleVideoEnded = async () => {
    setIsPlaying(false);
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/lessons/${id}/watch`, {
        timestamp: lesson?.duration || 0,
        duration: lesson?.duration || 0,
        completed: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mostra un messaggio di completamento o reindirizza alla prossima lezione
      if (lesson?.nextLesson) {
        // Chiedi all'utente se vuole passare alla prossima lezione
        const goToNext = window.confirm('Complimenti! Hai completato questa lezione. Vuoi passare alla prossima?');
        if (goToNext) {
          router.push(`/lessons/${lesson.nextLesson._id}`);
        }
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del completamento:', error);
    }
  };

  // Applica il watermark al video
  const applyWatermark = () => {
    if (!lesson?.protection.watermark.enabled) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="transform rotate-45 text-white text-xl font-bold">
          {lesson.protection.watermark.text}
        </div>
      </div>
    );
  };

  // Previeni la registrazione dello schermo
  useEffect(() => {
    if (lesson?.protection.screenRecordingProtection) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && videoRef.current) {
          videoRef.current.pause();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [lesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lezione non trovata</h2>
            <p className="text-gray-600 mb-4">La lezione che stai cercando non esiste o non è disponibile.</p>
            <Link href="/dashboard" className="btn-primary">
              Torna alla Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{lesson.title} | 7Sundays Academy</title>
        <meta name="description" content={lesson.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex text-sm text-gray-400">
              <li>
                <Link href="/dashboard" className="hover:text-primary-400">
                  Dashboard
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link href={`/courses/${lesson.course._id}`} className="hover:text-primary-400">
                  {lesson.course.title}
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li className="text-primary-400 font-medium truncate">{lesson.title}</li>
            </ol>
          </nav>

          {/* Messaggio di errore */}
          {error && (
            <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-6 text-white">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonna principale: Video e descrizione */}
            <div className="lg:col-span-2">
              {/* Player video */}
              <div className="bg-black rounded-lg overflow-hidden relative">
                {videoToken || lesson.videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full aspect-video"
                      controls
                      controlsList={lesson.protection.downloadDisabled ? 'nodownload' : ''}
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onEnded={handleVideoEnded}
                      poster="/images/video-poster.jpg"
                    >
                      <source 
                        src={videoToken ? `${lesson.videoUrl}?token=${videoToken}` : lesson.videoUrl} 
                        type="video/mp4" 
                      />
                      Il tuo browser non supporta il tag video.
                    </video>
                    {applyWatermark()}
                  </>
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center bg-gray-800 text-white">
                    <p>Video non disponibile</p>
                  </div>
                )}
              </div>

              {/* Titolo e descrizione */}
              <div className="mt-6 bg-gray-800 rounded-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <span>Lezione {lesson.order}</span>
                  <span className="mx-2">•</span>
                  <span>{lesson.formattedDuration}</span>
                </div>
                <p className="text-gray-300 whitespace-pre-line">{lesson.description}</p>
              </div>

              {/* Navigazione tra lezioni */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {lesson.prevLesson && (
                  <Link 
                    href={`/lessons/${lesson.prevLesson._id}`}
                    className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg flex items-center text-white transition duration-200"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-400">Lezione precedente</div>
                      <div className="font-medium truncate">{lesson.prevLesson.title}</div>
                    </div>
                  </Link>
                )}
                
                {lesson.nextLesson && (
                  <Link 
                    href={`/lessons/${lesson.nextLesson._id}`}
                    className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg flex items-center justify-end text-white transition duration-200"
                  >
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Lezione successiva</div>
                      <div className="font-medium truncate">{lesson.nextLesson.title}</div>
                    </div>
                    <svg className="h-5 w-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* Colonna laterale: Risorse e trascrizione */}
            <div className="lg:col-span-1">
              {/* Risorse */}
              <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                <div 
                  className="p-4 bg-gray-700 flex justify-between items-center cursor-pointer"
                  onClick={() => setShowResources(!showResources)}
                >
                  <h2 className="text-lg font-semibold text-white">Risorse della lezione</h2>
                  <svg 
                    className={`h-5 w-5 text-white transition-transform duration-200 ${showResources ? 'transform rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {showResources && (
                  <div className="p-4">
                    {lesson.resources && lesson.resources.length > 0 ? (
                      <ul className="space-y-3">
                        {lesson.resources.map((resource, index) => (
                          <li key={index}>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-primary-400 hover:text-primary-300"
                            >
                              {resource.type === 'pdf' && (
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                              )}
                              {resource.type === 'link' && (
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                              )}
                              {resource.type === 'file' && (
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                </svg>
                              )}
                              {resource.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">Nessuna risorsa disponibile per questa lezione.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Trascrizione */}
              {lesson.transcript && (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-gray-700 flex justify-between items-center cursor-pointer"
                    onClick={() => setShowTranscript(!showTranscript)}
                  >
                    <h2 className="text-lg font-semibold text-white">Trascrizione</h2>
                    <svg 
                      className={`h-5 w-5 text-white transition-transform duration-200 ${showTranscript ? 'transform rotate-180' : ''}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {showTranscript && (
                    <div className="p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-300 whitespace-pre-line">{lesson.transcript}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Torna al corso */}
              <div className="mt-6">
                <Link 
                  href={`/courses/${lesson.course._id}`}
                  className="btn-secondary w-full text-center flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Torna al Corso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}