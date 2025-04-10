import NetworkingContact from '../models/NetworkingContact.js';
import User from '../models/User.js';
import TestAttempt from '../models/TestAttempt.js';

// FUNZIONI MANCANTI AGGIUNTE QUI
// Crea un nuovo contatto di networking (solo per admin)
export const createContact = async (req, res) => {
  try {
    const newContact = await NetworkingContact.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        contact: newContact
      }
    });
  } catch (err) {
    console.error('Errore nella creazione del contatto:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Aggiorna un contatto di networking (solo per admin)
export const updateContact = async (req, res) => {
  try {
    const updatedContact = await NetworkingContact.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedContact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contatto non trovato'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        contact: updatedContact
      }
    });
  } catch (err) {
    console.error('Errore nell\'aggiornamento del contatto:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Elimina un contatto di networking (solo per admin)
export const deleteContact = async (req, res) => {
  try {
    const contact = await NetworkingContact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contatto non trovato'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    console.error('Errore nell\'eliminazione del contatto:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'eliminazione del contatto'
    });
  }
};
// FINE DELLE FUNZIONI AGGIUNTE

// Ottieni tutti i contatti di networking disponibili per l'utente
export const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Ottieni tutti i contatti attivi
    const allContacts = await NetworkingContact.find({ isActive: true });
    
    // Filtra i contatti in base ai requisiti dell'utente
    const availableContacts = [];
    for (const contact of allContacts) {
      const canAccess = await contact.canUserAccess(userId);
      if (canAccess) {
        availableContacts.push(contact);
      }
    }

    res.status(200).json({
      status: 'success',
      results: availableContacts.length,
      data: {
        contacts: availableContacts,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero dei contatti:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero dei contatti',
    });
  }
};

// Ottieni un singolo contatto di networking
export const getContactDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const contact = await NetworkingContact.findById(id);

    if (!contact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contatto non trovato',
      });
    }

    if (!contact.isActive && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Questo contatto non è più disponibile',
      });
    }

    // Verifica se l'utente può accedere a questo contatto
    if (req.user.role !== 'admin') {
      const canAccess = await contact.canUserAccess(userId);
      if (!canAccess) {
        return res.status(403).json({
          status: 'fail',
          message: 'Non hai i requisiti necessari per accedere a questo contatto',
        });
      }
    }

    // Incrementa il contatore delle visualizzazioni
    await contact.incrementViewCount();

    res.status(200).json({
      status: 'success',
      data: {
        contact,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero del contatto:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero del contatto',
    });
  }
};

// Cerca contatti in base a criteri
export const searchContacts = async (req, res) => {
  try {
    const { query, category, skills, location } = req.body;
    const userId = req.user.id;
    
    // Costruisci la query di ricerca
    let searchQuery = { isActive: true };
    
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { position: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      searchQuery.category = category;
    }
    
    if (skills && skills.length > 0) {
      searchQuery.skills = { $in: skills };
    }
    
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }
    
    // Esegui la query
    const searchResults = await NetworkingContact.find(searchQuery);
    
    // Filtra i contatti in base ai requisiti dell'utente
    const availableContacts = [];
    for (const contact of searchResults) {
      const canAccess = await contact.canUserAccess(userId);
      if (canAccess) {
        availableContacts.push(contact);
      }
    }
    
    res.status(200).json({
      status: 'success',
      results: availableContacts.length,
      data: {
        contacts: availableContacts
      }
    });
  } catch (err) {
    console.error('Errore nella ricerca dei contatti:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella ricerca dei contatti'
    });
  }
};

// Invia una richiesta di contatto
export const sendContactRequest = async (req, res) => {
  try {
    const { contactId, message } = req.body;
    const userId = req.user.id;
    
    // Verifica se il contatto esiste
    const contact = await NetworkingContact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contatto non trovato'
      });
    }

    if (!contact.isActive) {
      return res.status(403).json({
        status: 'fail',
        message: 'Questo contatto non è più disponibile'
      });
    }

    // Verifica se l'utente può accedere a questo contatto
    const canAccess = await contact.canUserAccess(userId);
    if (!canAccess) {
      return res.status(403).json({
        status: 'fail',
        message: 'Non hai i requisiti necessari per contattare questo professionista'
      });
    }
    
    // Incrementa il contatore delle richieste
    await contact.incrementContactCount();
    
    res.status(200).json({
      status: 'success',
      message: 'Richiesta di contatto inviata con successo'
    });
  } catch (err) {
    console.error('Errore nell\'invio della richiesta di contatto:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'invio della richiesta di contatto'
    });
  }
};

// Funzioni stub per le altre route
// Queste funzioni restituiscono un risultato base per far funzionare l'API
// In un'implementazione reale, dovrebbero essere completate con logica appropriata

// Accetta una richiesta di contatto
export const acceptContactRequest = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Richiesta di contatto accettata'
    });
  } catch (err) {
    console.error('Errore nell\'accettare la richiesta:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'accettare la richiesta'
    });
  }
};

// Rifiuta una richiesta di contatto
export const rejectContactRequest = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Richiesta di contatto rifiutata'
    });
  } catch (err) {
    console.error('Errore nel rifiutare la richiesta:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel rifiutare la richiesta'
    });
  }
};

// Ottieni le richieste di contatto pendenti
export const getPendingRequests = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        incoming: [],
        outgoing: []
      }
    });
  } catch (err) {
    console.error('Errore nel recupero delle richieste pendenti:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle richieste pendenti'
    });
  }
};

// Ottieni i messaggi con un contatto
export const getMessages = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      results: 0,
      data: {
        messages: []
      }
    });
  } catch (err) {
    console.error('Errore nel recupero dei messaggi:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero dei messaggi'
    });
  }
};

// Invia un messaggio a un contatto
export const sendMessage = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Messaggio inviato con successo'
    });
  } catch (err) {
    console.error('Errore nell\'invio del messaggio:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'invio del messaggio'
    });
  }
};

// Marca un messaggio come letto
export const markMessageAsRead = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Messaggio segnato come letto'
    });
  } catch (err) {
    console.error('Errore nel marcare il messaggio come letto:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel marcare il messaggio come letto'
    });
  }
};

// Elimina un messaggio
export const deleteMessage = async (req, res) => {
  try {
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    console.error('Errore nell\'eliminazione del messaggio:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'eliminazione del messaggio'
    });
  }
};

// Ottieni statistiche di networking per la dashboard admin
export const getNetworkingStats = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        contacts: {
          total: await NetworkingContact.countDocuments(),
          active: await NetworkingContact.countDocuments({ isActive: true })
        },
        // Altre statistiche semplificate
      }
    });
  } catch (err) {
    console.error('Errore nel recupero delle statistiche di networking:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle statistiche di networking'
    });
  }
};

// Ottieni i requisiti per accedere ai contatti di networking
export const getNetworkingRequirements = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Ottieni l'utente con i corsi completati e i punteggi dei test
    const user = await User.findById(userId).select('completedCourses testScores');
    
    // Ottieni tutti i contatti attivi
    const contacts = await NetworkingContact.find({ isActive: true })
      .select('requirements category skills')
      .populate('requirements.requiredTests', 'title')
      .populate('requirements.requiredCourses', 'title');
    
    // Raggruppa i requisiti per categoria
    const requirementsByCategory = {};
    
    for (const contact of contacts) {
      const category = contact.category;
      
      if (!requirementsByCategory[category]) {
        requirementsByCategory[category] = {
          requiredTests: new Set(),
          requiredCourses: new Set(),
          minTestScore: contact.requirements.minTestScore,
          skills: new Set(),
        };
      }
      
      // Aggiorna il punteggio minimo richiesto (prendi il più alto)
      if (contact.requirements.minTestScore > requirementsByCategory[category].minTestScore) {
        requirementsByCategory[category].minTestScore = contact.requirements.minTestScore;
      }
      
      // Aggiungi i test richiesti
      contact.requirements.requiredTests.forEach(test => {
        requirementsByCategory[category].requiredTests.add({
          id: test._id,
          title: test.title,
        });
      });
      
      // Aggiungi i corsi richiesti
      contact.requirements.requiredCourses.forEach(course => {
        requirementsByCategory[category].requiredCourses.add({
          id: course._id,
          title: course.title,
        });
      });
      
      // Aggiungi le competenze
      contact.skills.forEach(skill => {
        requirementsByCategory[category].skills.add(skill);
      });
    }
    
    // Converti i Set in array
    for (const category in requirementsByCategory) {
      requirementsByCategory[category].requiredTests = Array.from(requirementsByCategory[category].requiredTests);
      requirementsByCategory[category].requiredCourses = Array.from(requirementsByCategory[category].requiredCourses);
      requirementsByCategory[category].skills = Array.from(requirementsByCategory[category].skills);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        requirementsByCategory,
        userProgress: {
          completedCourses: user.completedCourses,
          testScores: Object.fromEntries(user.testScores),
        },
      },
    });
  } catch (err) {
    console.error('Errore nel recupero dei requisiti:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero dei requisiti',
    });
  }
};