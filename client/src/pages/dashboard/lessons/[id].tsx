import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
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

interface Note {
  _id: string;
  user: string;
  lesson: string;
  content: string;
  timestamp: number;
  createdAt: Date;
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
  const [notes, setNotes] = useState<Note[] | []>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestionText, setNewQuestionText] = useState<string>('');


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

  // Fetch the notes
  useEffect(() => {
    const fetchNotes = async () => {
        if (!id || !isAuthenticated) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/lessons/${id}/notes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(response.data.notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    if (id && isAuthenticated) {
        fetchNotes();
    }
}, [id, isAuthenticated]);



    // Carica le domande da localStorage all'avvio
    useEffect(() => {
        const storedQuestions = localStorage.getItem(`questions-${id}`);
        if (storedQuestions) {
            setQuestions(JSON.parse(storedQuestions));
        }
    }, [id]);



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

  const handleAddNote = async (text: string) => {
    if (!text.trim() || !videoRef.current) return;
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`/api/lessons/${id}/notes`, {
            content: text,
            timestamp: Math.floor(videoRef.current.currentTime),
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotes([...notes, response.data.note]);
        console.log(response.data.note);


    } catch (error) {
        console.error('Error creating note:', error);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(0);
    date.setSeconds(timestamp);
    return date.toISOString().substring(11, 19); // hh:mm:ss
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/lessons/${id}/notes/${noteId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(notes.filter((note) => note._id !== noteId));
    } catch (error) {
        console.error('Error deleting note:', error);
    }
  };

  const handleAddQuestion = async (text: string) => {
    if (!text.trim()) return;

    const newQuestion: Question = {
        id: Math.random().toString(36).substring(7), // Generate a random ID
        text: text,
    };

    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);

    
    localStorage.setItem(`questions-${id}`, JSON.stringify([...questions, newQuestion]));

  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setEditedNoteText('');
    }    
  };

  const handleDeleteQuestion = (questionId: string) => {


    setQuestions((prevQuestions) => prevQuestions.filter((question) => question.id !== questionId));
    
    // Aggiorna le domande in localStorage
    const updatedQuestions = questions.filter((question) => question.id !== questionId)
    localStorage.setItem(`questions-${id}`, JSON.stringify(updatedQuestions));
  };



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
                      allowFullScreen
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

              {/* Barra di progresso */}
              <div className="mt-2 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${lesson?.duration ? (currentTime / lesson.duration) * 100 : 0}%` }}
                ></div>
              </div>

              {/* Titolo e descrizione */}
              <div className="mt-6  p-6 text-white">
                <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
                <div className="flex items-center text-lg text-gray-400 mb-4">
                  <span>Lesson {lesson.order}</span>
                  <span className="mx-2">•</span>
                  <span>Duration: {lesson.formattedDuration}</span>
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
                {/* Note */}
                <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                    <div className="p-4 bg-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">Appunti</h2>
                    </div>
                    <NotesSection notes={notes} handleAddNote={handleAddNote} formatTimestamp={formatTimestamp} handleDeleteNote={handleDeleteNote}/>
                </div>
                {/* Q&A */}
                <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                    <div className="p-4 bg-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">Q&A</h2>
                    </div>
                    <QandASection questions={questions} handleAddQuestion={handleAddQuestion} handleDeleteQuestion={handleDeleteQuestion}/>
                </div>
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
                            <li key={question.id} className="bg-gray-700 p-2 rounded-md relative">
                                <div>
                                    <p className="whitespace-pre-wrap">{question.text}</p>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-2">
                                  <button className="text-xs text-gray-400 hover:text-gray-300" onClick={() => handleDeleteQuestion(question.id)}>Elimina</button>
                                </div>
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

function NotesSection({ notes, handleAddNote, formatTimestamp, handleDeleteNote }: { notes: Note[], handleAddNote: (text: string) => void, formatTimestamp: (timestamp: number) => string, handleDeleteNote: (noteId: string) => void }) {
    const [newNoteText, setNewNoteText] = useState('');
  
    return (
      <div className='p-4'>
        <input type='text' placeholder='Scrivi qui i tuoi appunti' value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} className='w-full bg-gray-700 text-white p-2 rounded-md mb-2'/>
        <button onClick={() => handleAddNote(newNoteText)} className='btn-primary'>Aggiungi appunto</button>
        <ul className='mt-4 space-y-2'>
          {notes.map((note) => (
            <li key={note._id} className="bg-gray-700 p-2 rounded-md relative">
              <div >
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-gray-400 mt-1">{formatTimestamp(note.timestamp)} - {format(new Date(note.createdAt), 'dd/MM/yyyy')}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="text-xs text-gray-400 hover:text-gray-300" onClick={() => handleDeleteNote(note._id)}>Elimina</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
}

function QandASection({ questions, handleAddQuestion, handleDeleteQuestion }: { questions: any[], handleAddQuestion: (text: string) => void, handleDeleteQuestion: (questionId: string) => void }) {
    const [newQuestionText, setNewQuestionText] = useState('');
  
    return (
      <div className='p-4'>
        <input type='text' placeholder='Scrivi qui la tua domanda' className='w-full bg-gray-700 text-white p-2 rounded-md mb-2' value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)}/>
        <button className='btn-primary' onClick={() => handleAddQuestion(newQuestionText)}>Aggiungi domanda</button>
        <ul className='mt-4 space-y-2'>
        {questions.map((question) => (
            <li key={question.id} className="bg-gray-700 p-2 rounded-md relative">
                <p className="whitespace-pre-wrap">{question.text}</p>
                <button className="text-xs text-gray-400 hover:text-gray-300" onClick={() => handleDeleteQuestion(question.id)}>Elimina</button>
            </li>
        ))}
        </ul>
      </div>
    );
}