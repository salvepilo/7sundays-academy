import * as Test from '../models/Test.js';
import * as TestAttempt from '../models/TestAttempt.js';
import * as User from '../models/User.js';
import * as Course from '../models/Course.js';

import dotenv from 'dotenv';

// Inizializza il client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ottieni tutti i test (con filtri opzionali)
export const getAllTests = async (req, res) => {
  try {
    // Costruisci la query di filtro
    const queryObj = { ...req.query };   
    const excludedFields = ['page', 'sort', 'limit', 'fields']; excludedFields.forEach(el => delete queryObj[el]);

    let query = Test.find(queryObj);if(req.user && req.user.role !== "admin") {
      query = query.find({ isPublished: true });
    }

    // Ordinamento
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Paginazione
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Esegui la query
    const tests = await query.populate('course', 'title');

    // Aggiungi informazioni sui tentativi dell'utente corrente
    let testsWithAttempts = tests;    
    if(req.user) {
      testsWithAttempts = await Promise.all(
        tests.map(async (test) => {
          const testObj = test.toObject(); // Converti il documento Mongoose in un oggetto JavaScript normale

          // Ottieni il miglior punteggio dell'utente
          const bestScore = await TestAttempt.getBestScore(
            req.user.id,
            test._id
          );

          // Ottieni il numero di tentativi
          const attemptsCount = await TestAttempt.countUserAttempts(
            req.user.id,
            test._id
          );

          // Verifica se l'utente ha superato il test
          const hasPassed = await TestAttempt.hasUserPassedTest(
            req.user.id,
            test._id
          );

          return {
            userBestScore: bestScore,
            userAttemptsCount: attemptsCount,
            userHasPassed: hasPassed,
            canRetake: test.allowRetake && attemptsCount < test.maxAttempts,
          };
        })
      );
    }

    res.status(200).json({
      status: 'success',
      results: testsWithAttempts.length,
      data: {
        tests: testsWithAttempts,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero dei test:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero dei test',
    });
  }
};

// Ottieni un singolo test per ID
export const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('course', 'title');

    if (!test) {
      return res.status(404).json({
        status: 'fail',
        message: 'Test non trovato',
      });
    }

    // Verifica se il test è pubblicato o se l'utente è admin
    if (!test.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        status: 'fail',
        message: 'Questo test non è ancora disponibile',
      });
    }

    // Aggiungi informazioni sui tentativi dell'utente corrente
    let testWithAttempts = test.toObject();
    if(req.user){
      // Ottieni il miglior punteggio dell'utente
      const bestScore = await TestAttempt.getBestScore(
        req.user.id,
        test._id
      );

      // Ottieni il numero di tentativi
      const attemptsCount = await TestAttempt.countUserAttempts(
        req.user.id,
        test._id
      );

      // Verifica se l'utente ha superato il test
      const hasPassed = await TestAttempt.hasUserPassedTest(
        req.user.id,
        test._id
      );

      testWithAttempts.userBestScore = bestScore;
      testWithAttempts.userAttemptsCount = attemptsCount;
      testWithAttempts.userHasPassed = hasPassed;
      testWithAttempts.canRetake = test.allowRetake && attemptsCount < test.maxAttempts;

      // Se l'utente non è admin, rimuovi le risposte corrette
      if(req.user.role !== "admin" && !test.showCorrectAnswers){
        testWithAttempts.questions = testWithAttempts.questions.map(q => {
          const {
            correctAnswer,
            aiEvaluationCriteria,
            ...questionWithoutAnswer
          } = q;
          return questionWithoutAnswer;
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        test: testWithAttempts,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero del test:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero del test',
    });
  }
};

// Crea un nuovo test (solo admin)
export const createTest = async (req, res) => {
  try {
    // Verifica se il corso esiste
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato',
      });
    }

    const newTest = await Test.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        test: newTest,
      },
    });
  } catch (err) {
    console.error('Errore nella creazione del test:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Aggiorna un test (solo admin)
export const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!test) {
      return res.status(404).json({
        status: 'fail',
        message: 'Test non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        test,
      },
    });
  } catch (err) {
    console.error('Errore nell\'aggiornamento del test:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Elimina un test (solo admin)
export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);

    if (!test) {
      return res.status(404).json({
        status: 'fail',
        message: 'Test non trovato',
      });
    }

    // Elimina anche tutti i tentativi associati    
    await TestAttempt.deleteMany({ test: req.params.id });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Errore nell\'eliminazione del test:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'eliminazione del test',
    });
  }
};

// Inizia un tentativo di test
export const startTestAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verifica se il test esiste ed è pubblicato
    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({
        status: 'fail',
        message: 'Test non trovato',
      });
    }

    if (!test.isPublished && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Questo test non è ancora disponibile',
      });
    }

    // Verifica se l'utente può fare un altro tentativo
    const attemptsCount = await TestAttempt.countUserAttempts(userId, id);    
    if (attemptsCount >= test.maxAttempts && !test.allowRetake) {
      return res.status(400).json({
        status: 'fail',
        message: 'Hai raggiunto il numero massimo di tentativi per questo test',
      });
    }

    // Prepara le domande (eventualmente randomizzate)
    let questions = [...test.questions];
    if (test.randomizeQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }    
    // Rimuovi le risposte corrette dalle domande    
    const questionsWithoutAnswers = questions.map(q => {
      const { correctAnswer, aiEvaluationCriteria, ...questionWithoutAnswer } = q;
      return questionWithoutAnswer;
    })    
    

    

    res.status(200).json({
      status: 'success',
      data: {
        testId: test._id,
        title: test.title,
        description: test.description,
        timeLimit: test.timeLimit,
        questions: questionsWithoutAnswers,
        totalPoints: test.totalPoints,
        questionCount: test.questionCount,
        startedAt: new Date(),
        attempt: attemptsCount + 1,
      },
    });
  } catch (err) {
    console.error('Errore nell\'avvio del test:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'avvio del test',
    });
  }
};

// Invia le risposte e valuta il test
export const submitTestAttempt = async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    const { answers, startedAt } = req.body;
    const userId = req.user.id;

    // Verifica se il test esiste
    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({status: 'fail',

        message: 'Test non trovato',
      });
    }

    // Calcola il tempo impiegato
    const completedAt = new Date();
    const timeSpent = Math.round((completedAt - new Date(startedAt)) / 1000); // in secondi

    // Verifica se il tempo è scaduto
    if (timeSpent > test.timeLimit * 60) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tempo scaduto. Il test è stato terminato automaticamente.',
      });
    }

    // Valuta le risposte
    const evaluatedAnswers = [];
    let totalScore = 0;
    const maxScore = test.totalPoints;

    // Processa le risposte
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = test.questions[answer.questionIndex];

      if (!question) {
        return res.status(400).json({
          status: 'fail',
          message: `Domanda con indice ${answer.questionIndex} non trovata`,
        });
      }

      let isCorrect = false;
        let points = 0;        
      let aiEvaluation = null;

      // Valuta la risposta in base al tipo di domanda
      if (question.type === 'open-ended' && question.aiEvaluation) {
        // Valutazione con OpenAI per domande aperte
        try {
          const aiScore = await evaluateWithOpenAI(
            question.question,
            answer.answer,
            question.aiEvaluationCriteria
          );

          points = aiScore * question.points;
          isCorrect = aiScore >= 0.7; // Considera corretta se il punteggio è almeno 0.7

          aiEvaluation = {            
            score: aiScore,

            feedback: await generateFeedback(question.question, answer.answer, aiScore),
          };
        } catch (error) {
          console.error('Errore nella valutazione con OpenAI:', error);
          // In caso di errore, valuta manualmente
          isCorrect = false;
          points = 0;
          aiEvaluation = {            
            score: 0,
            feedback: 'Impossibile valutare la risposta automaticamente. Contatta un amministratore.',
          };
        }
      } else {
        // Valutazione standard per domande a scelta multipla o vero/falso
        isCorrect = answer.answer === question.correctAnswer;
        points = isCorrect ? question.points : 0;
      }

      totalScore += points;
      evaluatedAnswers.push({
        questionIndex: answer.questionIndex,
        answer: answer.answer,

        isCorrect,


        aiEvaluation,
        points,
      });
    }

    // Calcola il punteggio percentuale
    const percentageScore = Math.round((totalScore / maxScore) * 100);

    // Determina se l'utente ha superato il test
    const passed = percentageScore >= test.passingScore;    

    // Ottieni il numero del tentativo
    const attemptsCount = await TestAttempt.countUserAttempts(userId, id);

    // Crea un nuovo tentativo di test
    const testAttempt = await TestAttempt.create({
      user: userId,
      test: id,
      course: test.course,
      answers: evaluatedAnswers,
      score: totalScore,
      maxScore,
      percentageScore,
      passed,
      startedAt,
      completedAt,
      timeSpent,
      attempt: attemptsCount + 1,
    });

    // Aggiorna le statistiche del test
    await test.updateStats(percentageScore, passed);

    // Se l'utente ha superato il test, aggiorna il suo punteggio
    if (passed) {
      const user = await User.findById(userId);
      user.testScores.set(id.toString(), percentageScore);      
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      status: 'success',
      data: {
        testAttempt: {
          id: testAttempt._id,
          score: totalScore,
          maxScore,
          percentageScore,
          passed,
          timeSpent,
          completedAt,
          answers: evaluatedAnswers,
        },
      },
    });
  } catch (err) {
    console.error('Errore nella valutazione del test:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella valutazione del test',
    });
  }
};

// Ottieni i tentativi di test dell'utente corrente
export const getUserTestAttempts = async (req, res) => {
  try {
    const userId = req.user.id;

    const attempts = await TestAttempt.find({ user: userId })
      .populate('test', 'title passingScore')
      .populate('course', 'title')
      .sort('-completedAt');

    res.status(200).json({
      status: 'success',
      results: attempts.length,
      data: {
        attempts,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero dei tentativi:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero dei tentativi',
    });
  }
};

// Ottieni un singolo tentativo di test
export const getTestAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId)
      .populate('test', 'title questions passingScore showCorrectAnswers')
      .populate('course', 'title');

    if (!attempt) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tentativo non trovato',
      });
    }

    // Verifica che l'utente sia il proprietario del tentativo o un admin    
    if (attempt.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Non sei autorizzato a visualizzare questo tentativo',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        attempt,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero del tentativo:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero del tentativo',
    });
  }
};

// Pubblica o nascondi un test (solo admin)
export const publishTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    // Verifica che il valore sia booleano    
    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'Il parametro isPublished deve essere un valore booleano',
      });
    }

    // Trova e aggiorna il test
    const test = await Test.findByIdAndUpdate(
      id,
      {        
        isPublished,
        publishedAt: isPublished && !test?.publishedAt ? Date.now() : test?.publishedAt
      },
      { new: true, runValidators: true, }
    );
    
    if (!test) {
      return res.status(404).json({
        status: 'fail',
        message: 'Test non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        test,
      },
    });
  } catch (err){
    console.error('Errore nella pubblicazione del test:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella pubblicazione del test'
    });
  }
};

// Ottieni statistiche dei test per la dashboard admin
export const getTestStats = async (req, res) => {
  try {    
    // Statistiche generali dei test
    const totalTests = await Test.countDocuments();
    const publishedTests = await Test.countDocuments({ isPublished: true });

    // Statistiche di completamento
    const totalAttempts = await TestAttempt.countDocuments();
    const passedAttempts = await TestAttempt.countDocuments({ passed: true });
    const completionRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

    // Test più difficili (tasso di superamento più basso)
    const hardestTests = await Test.aggregate([
      {
        $match: {
          isPublished: true, 
          attemptCount: { $gt: 5 } // Solo test con almeno 5 tentativi
        }
      },
      {
        $project: {
          title: 1,
          passingScore: 1,
          passRate: { $divide: [{ $multiply: ['$passCount', 100] }, '$attemptCount'] },
          averageScore: 1,
          attemptCount: 1
        }
      },
      { $sort: { passRate: 1 } },
      { $limit: 5 }
    ]);

    // Test più popolari (maggior numero di tentativi)
    const popularTests = await Test.aggregate([
      { $match: { isPublished: true } },
      { $sort: { attemptCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          attemptCount: 1,
          averageScore: 1,
          passRate: { $divide: [{ $multiply: ['$passCount', 100] }, { $max: ['$attemptCount', 1] }] },
        }
      }
    ]);  

    res.status(200).json({
      status: 'success',
      data: {
        totalTests,
        publishedTests,
        totalAttempts,
        passedAttempts, 
        completionRate,
        hardestTests,
        popularTests,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero delle statistiche dei test:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle statistiche dei test'
    });
  }
};


// Funzione per valutare una risposta aperta con OpenAI
const evaluateWithOpenAI = async (question, answer, criteria) => {
  try {
    const prompt = `
      Valuta la seguente risposta alla domanda in base ai criteri specificati.
            Domanda: ${question}  
      
      Risposta: ${answer}
      
      Criteri di valutazione: ${criteria || 'Valuta la correttezza, la completezza e la chiarezza della risposta.'}
      
      Fornisci un punteggio da 0 a 1, dove 0 è completamente errato e 1 è perfetto.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Sei un valutatore esperto di test educativi. Il tuo compito è valutare le risposte degli studenti in modo equo e obiettivo." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const responseText = response.choices[0].message.content.trim();

    // Estrai il punteggio numerico dalla risposta
    const scoreMatch = responseText.match(/([0-9]\.[0-9]+|[0-9]+)/);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[0]);
      return Math.min(Math.max(score, 0), 1); // Assicura che il punteggio sia tra 0 e 1
    } 
    
    // Se non riesce a estrarre un punteggio numerico, restituisci un valore predefinito
    return 0.5;
  } catch (error) {
    console.error('Errore nella valutazione con OpenAI:', error);
    throw error;
  }
};

// Funzione per generare feedback per una risposta
const generateFeedback = async (question, answer, score) => {
  try {    
    const prompt = `
      Fornisci un feedback costruttivo per la seguente risposta a una domanda.    
      
      Domanda: ${question}
      
      Risposta: ${answer}
      
      Punteggio assegnato: ${score} (su una scala da 0 a 1)
      
      Fornisci un feedback che spieghi i punti di forza e le aree di miglioramento della risposta.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Sei un tutor educativo che fornisce feedback costruttivi agli studenti." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Errore nella generazione del feedback:', error);
    return 'Impossibile generare un feedback dettagliato. Rivedi la tua risposta e confrontala con il materiale del corso.';
  }
};