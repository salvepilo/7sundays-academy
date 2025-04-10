import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Componenti
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Tipi
interface Question {
  _id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'open-ended';
  options?: string[];
  points: number;
  aiEvaluation: boolean;
  userAnswer?: string;
}

interface Test {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
  };
  questions: Question[];
  timeLimit: number;
  passingScore: number;
  totalPoints: number;
  allowRetake: boolean;
  maxAttempts: number;
  userAttemptsCount?: number;
  userBestScore?: number;
  userHasPassed?: boolean;
}

interface TestAttempt {
  _id: string;
  startTime: Date;
  endTime?: Date;
  answers: {
    questionId: string;
    answer: string;
    score?: number;
    feedback?: string;
  }[];
  score?: number;
  passed?: boolean;
  status: 'in-progress' | 'completed' | 'evaluated';
}

export default function TestDetail() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState<Test | null>(null);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    feedback?: string;
  } | null>(null);

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push(`/auth/login?redirect=/tests/${id}`);
    }
  }, [isAuthenticated, isLoading, router, id]);

  // Carica i dettagli del test
  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!id || !isAuthenticated) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`/api/tests/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const testData = response.data.data.test;
        setTest(testData);
        
        // Verifica se l'utente può fare il test
        if (testData.userAttemptsCount >= testData.maxAttempts && !testData.allowRetake) {
          setError('Hai raggiunto il numero massimo di tentativi per questo test.');
          setIsLoading(false);
          return;
        }
        
        // Inizia un nuovo tentativo
        const attemptResponse = await axios.post(`/api/tests/${id}/attempt`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const attemptData = attemptResponse.data.data.attempt;
        setAttempt(attemptData);
        setTimeLeft(testData.timeLimit * 60); // Converti in secondi
        
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento del test:', error);
        setIsLoading(false);
        setError('Impossibile caricare il test. Verifica di essere iscritto al corso.');
        
        // Dati di esempio in caso di errore
        const mockTest: Test = {
          _id: id as string,
          title: 'Test di Marketing Digitale',
          description: 'Verifica le tue conoscenze sui principi fondamentali del marketing digitale.',
          course: {
            _id: 'c1',
            title: 'Marketing Digitale Completo'
          },
          questions: [
            {
              _id: 'q1',
              question: 'Quale delle seguenti NON è una componente del marketing digitale?',
              type: 'multiple-choice',
              options: [
                'SEO (Search Engine Optimization)',
                'Email Marketing',
                'Pubblicità televisiva tradizionale',
                'Social Media Marketing'
              ],
              points: 1,
              aiEvaluation: false
            },
            {
              _id: 'q2',
              question: 'Il Content Marketing si concentra principalmente sulla creazione di contenuti di valore per attrarre e coinvolgere un pubblico specifico.',
              type: 'true-false',
              options: ['Vero', 'Falso'],
              points: 1,
              aiEvaluation: false
            },
            {
              _id: 'q3',
              question: 'Spiega brevemente come il marketing digitale può aiutare una piccola impresa locale a crescere. Fornisci almeno tre esempi specifici.',
              type: 'open-ended',
              points: 3,
              aiEvaluation: true
            }
          ],
          timeLimit: 30,
          passingScore: 70,
          totalPoints: 5,
          allowRetake: true,
          maxAttempts: 3,
          userAttemptsCount: 0
        };
        
        setTest(mockTest);
        
        // Mock di un tentativo
        const mockAttempt: TestAttempt = {
          _id: 'a1',
          startTime: new Date(),
          answers: [],
          status: 'in-progress'
        };
        
        setAttempt(mockAttempt);
        setTimeLeft(mockTest.timeLimit * 60);
      }
    };

    if (id && isAuthenticated) {
      fetchTestDetails();
    }
  }, [id, isAuthenticated]);

  // Timer per il tempo rimanente
  useEffect(() => {
    if (timeLeft === null || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testCompleted]);

  // Gestisce lo scadere del tempo
  const handleTimeUp = async () => {
    if (testCompleted) return;
    
    setIsSubmitting(true);
    await submitTest();
    setIsSubmitting(false);
  };

  // Formatta il tempo rimanente
  const formatTimeLeft = () => {
    if (timeLeft === null) return '--:--';
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Gestisce il cambio di risposta
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Naviga alla domanda precedente
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Naviga alla domanda successiva
  const goToNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Invia il test
  const submitTest = async () => {
    if (!test || !attempt) return;
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Prepara le risposte nel formato richiesto dall'API
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));
      
      const response = await axios.patch(`/api/tests/${id}/attempt/${attempt._id}`, {
        answers: formattedAnswers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = response.data.data.result;
      setTestResult({
        score: result.score,
        totalPoints: result.totalPoints,
        percentage: result.percentage,
        passed: result.passed,
        feedback: result.feedback
      });
      
      setTestCompleted(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Errore nell\'invio del test:', error);
      setIsSubmitting(false);
      setError('Si è verificato un errore durante l\'invio del test. Riprova.');
      
      // Mock del risultato in caso di errore
      setTestResult({
        score: 4,
        totalPoints: 5,
        percentage: 80,
        passed: true,
        feedback: 'Ottimo lavoro! Hai dimostrato una buona comprensione dei concetti di marketing digitale.'
      });
      
      setTestCompleted(true);
    }
  };

  // Renderizza la domanda corrente
  const renderCurrentQuestion = () => {
    if (!test) return null;
    
    const question = test.questions[currentQuestionIndex];
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <span className="text-sm font-medium text-gray-500">
            Domanda {currentQuestionIndex + 1} di {test.questions.length}
          </span>
          <h3 className="text-xl font-semibold text-gray-900 mt-1">{question.question}</h3>
        </div>
        
        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={answers[question._id] === option}
                  onChange={() => handleAnswerChange(question._id, option)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'true-false' && (
          <div className="space-y-3">
            {['Vero', 'Falso'].map((option, index) => (
              <label key={index} className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={answers[question._id] === option}
                  onChange={() => handleAnswerChange(question._id, option)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'open-ended' && (
          <div>
            <textarea
              rows={6}
              placeholder="Scrivi la tua risposta qui..."
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {question.aiEvaluation && (
              <p className="mt-2 text-sm text-gray-500">
                Questa risposta sarà valutata utilizzando l'intelligenza artificiale.
              </p>
            )}
          </div>
        )}
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-md ${currentQuestionIndex === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Precedente
          </button>
          
          {currentQuestionIndex < test.questions.length - 1 ? (
            <button
              type="button"
              onClick={goToNextQuestion}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Successiva
            </button>
          ) : (
            <button
              type="button"
              onClick={submitTest}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md ${isSubmitting ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} text-white`}
            >
              {isSubmitting ? 'Invio in corso...' : 'Termina Test'}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Renderizza il risultato del test
  const renderTestResult = () => {
    if (!testResult || !test) return null;
    
    const isPassed = testResult.passed;
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full ${isPassed ? 'bg-green-100' : 'bg-red-100'} mb-6`}>
          {isPassed ? (
            <svg className="h-12 w-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-12 w-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isPassed ? 'Congratulazioni!' : 'Test non superato'}
        </h2>
        
        <p className="text-lg text-gray-600 mb-6">
          {isPassed 
            ? 'Hai superato il test con successo!' 
            : `Non hai raggiunto il punteggio minimo richiesto (${test.passingScore}%).`}
        </p>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Punteggio:</span>
            <span className="font-semibold">{testResult.score}/{testResult.totalPoints}</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2.5 mb-2">
            <div 
              className={`h-2.5 rounded-full ${isPassed ? 'bg-green-600' : 'bg-red-600'}`} 
              style={{ width: `${testResult.percentage}%` }}
            ></div>
          </div>
          <div className="text-right text-sm text-gray-600">{testResult.percentage}%</div>
        </div>
        
        {testResult.feedback && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
            <p className="text-gray-700">{testResult.feedback}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href={`/courses/${test.course._id}`}
            className="btn-secondary"
          >
            Torna al Corso
          </Link>
          
          {!isPassed && test.allowRetake && (test.userAttemptsCount || 0) < test.maxAttempts && (
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Riprova Test
            </button>
          )}
        </div>
      </div>
    );
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

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test non trovato</h2>
            <p className="text-gray-600 mb-4">Il test che stai cercando non esiste o non è disponibile.</p>
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
        <title>{test.title} | 7Sundays Academy</title>
        <meta name="description" content={test.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex text-sm text-gray-500">
              <li>
                <Link href="/dashboard" className="hover:text-primary-600">
                  Dashboard
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link href={`/courses/${test.course._id}`} className="hover:text-primary-600">
                  {test.course.title}
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li className="text-primary-600 font-medium truncate">Test: {test.title}</li>
            </ol>
          </nav>

          {/* Messaggio di errore */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Intestazione del test */}
          {!testCompleted && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
                  <p className="text-gray-600">{test.description}</p>
                </div>
                <div className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full font-medium">
                  Tempo: {formatTimeLeft()}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Domande</div>
                  <div className="font-semibold">{test.questions.length}</div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Punti Totali</div>
                  <div className="font-semibold">{test.totalPoints}</div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Punteggio Minimo</div>
                  <div className="font-semibold">{test.passingScore}%</div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Tentativi</div>
                  <div className="font-semibold">{test.userAttemptsCount || 0}/{test.maxAttempts}</div>
                </div>
              </div>
            </div>
          )}

          {/* Contenuto del test */}
          {testCompleted ? renderTestResult() : renderCurrentQuestion()}

          {/* Navigazione tra le domande (solo se il test è in corso) */}
          {!testCompleted && test.questions.length > 1 && (
            <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {test.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${currentQuestionIndex === index ? 'bg-primary-600 text-white' : answers[test.questions[index]._id] ? 'bg-primary-100 text-primary-800' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}