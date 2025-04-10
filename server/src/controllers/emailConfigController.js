/**
 * Controller per la gestione delle configurazioni email SMTP
 * Gestisce le operazioni CRUD sulle configurazioni email e il test della connessione
*/
import EmailConfig from '../models/EmailConfig.js';
import nodemailer from 'nodemailer';

/**
 * Ottiene tutte le configurazioni email
 * @route GET /api/email-config
 * @access Admin
 */
export const getAllEmailConfigs = async (req, res) => {
  try {
    const configs = await EmailConfig.find().select('-auth.pass');

    res.status(200).json({
      status: 'success',
      results: configs.length,
      data: {
        configs,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero delle configurazioni email:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle configurazioni email',
    });
  }
};

/**
 * Ottiene la configurazione email attiva
 * @route GET /api/email-config/active
 * @access Admin
 */
export const getActiveEmailConfig = async (req, res) => {
  try {
    const config = await EmailConfig.findOne({ isActive: true }).select('-auth.pass');

    if (!config) {
      return res.status(404).json({
        status: 'fail',
        message: 'Nessuna configurazione email attiva trovata',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        config,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero della configurazione email attiva:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero della configurazione email attiva',
    });
  }
};

/**
 * Ottiene una configurazione email specifica per ID
 * @route GET /api/email-config/:id
 * @access Admin
 */
export const getEmailConfig = async (req, res) => {
  try {
    const config = await EmailConfig.findById(req.params.id).select('-auth.pass');

    if (!config) {
      return res.status(404).json({
        status: 'fail',
        message: 'Configurazione email non trovata',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        config,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero della configurazione email:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero della configurazione email',
    });
  }
};

/**
 * Crea una nuova configurazione email
 * @route POST /api/email-config
 * @access Admin
 */
export const createEmailConfig = async (req, res) => {
  try {
    // Aggiungi l'utente corrente come creatore
    req.body.createdBy = req.user.id;

    const newConfig = await EmailConfig.create(req.body);

    // Rimuovi la password dalla risposta
    const configResponse = newConfig.toObject();
    delete configResponse.auth.pass;

    res.status(201).json({
      status: 'success',
      data: {
        config: configResponse,
      },
    });
  } catch (err) {
    console.error('Errore nella creazione della configurazione email:', err);
    res.status(400).json({
      status: 'error',
      message: err.message || 'Errore nella creazione della configurazione email',
    });
  }
};

/**
 * Aggiorna una configurazione email esistente
 * @route PATCH /api/email-config/:id
 * @access Admin
 */
export const updateEmailConfig = async (req, res) => {
  try {
    // Aggiungi l'utente corrente come aggiornatore
    req.body.updatedBy = req.user.id;

    const config = await EmailConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select('-auth.pass');

    if (!config) {
      return res.status(404).json({
        status: 'fail',
        message: 'Configurazione email non trovata',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        config,
      },
    });
  } catch (err) {
    console.error('Errore nell\'aggiornamento della configurazione email:', err);
    res.status(400).json({
      status: 'error',
      message: err.message || 'Errore nell\'aggiornamento della configurazione email',
    });
  }
};

/**
 * Elimina una configurazione email
 * @route DELETE /api/email-config/:id
 * @access Admin
 */
export const deleteEmailConfig = async (req, res) => {
  try {
    const config = await EmailConfig.findById(req.params.id);

    if (!config) {
      return res.status(404).json({
        status: 'fail',
        message: 'Configurazione email non trovata',
      });
    }

    // Impedisci l'eliminazione se è l'unica configurazione attiva
    if (config.isActive) {
      const count = await EmailConfig.countDocuments();
      if (count === 1) {
        return res.status(400).json({
          status: 'fail',
          message: 'Impossibile eliminare l\'unica configurazione email attiva',
        });
      }
    }

    await EmailConfig.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Errore nell\'eliminazione della configurazione email:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'eliminazione della configurazione email',
    });
  }
};

/**
 * Attiva una configurazione email specifica
 * @route PATCH /api/email-config/:id/activate
 * @access Admin
 */
export const activateEmailConfig = async (req, res) => {
  try {
    // Aggiorna l'utente che ha fatto la modifica
    const config = await EmailConfig.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: true,
        updatedBy: req.user.id 
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-auth.pass');

    if (!config) {
      return res.status(404).json({
        status: 'fail',
        message: 'Configurazione email non trovata',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        config,
      },
    });
  } catch (err) {
    console.error('Errore nell\'attivazione della configurazione email:', err);
    res.status(400).json({
      status: 'error',
      message: err.message || 'Errore nell\'attivazione della configurazione email',
    });
  }
};

/**
 * Testa una configurazione email
 * @route POST /api/email-config/test
 * @access Admin
 */
export const testEmailConfig = async (req, res) => {
  try {
    const { host, port, secure, auth, testEmail } = req.body;

    if (!host || !port || !auth || !auth.user || !auth.pass || !testEmail) {
      return res.status(400).json({
        status: 'fail',
        message: 'Dati di configurazione incompleti',
      });
    }

    // Crea un transporter temporaneo per il test
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: secure || false,
      auth: {
        user: auth.user,
        pass: auth.pass,
      },
      tls: {
        rejectUnauthorized: false, // Utile in ambiente di sviluppo
      },
    });

    // Verifica la connessione
    await transporter.verify();

    // Invia un'email di test
    const result = await transporter.sendMail({
      from: auth.user,
      to: testEmail,
      subject: 'Test configurazione email - 7Sundays Academy',
      text: 'Questa è un\'email di test per verificare la configurazione SMTP.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Test Configurazione Email</h2>
          <p>Questa è un'email di test per verificare la configurazione SMTP.</p>
          <p>Se stai ricevendo questa email, la configurazione è corretta!</p>
          <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
            <p style="margin: 0;">Configurazione testata:</p>
            <ul>
              <li>Host: ${host}</li>
              <li>Porta: ${port}</li>
              <li>Sicuro: ${secure ? 'Sì' : 'No'}</li>
              <li>Utente: ${auth.user}</li>
            </ul>
          </div>
          <p style="margin-top: 30px;">Il team di 7Sundays Academy</p>
        </div>
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'Test email inviata con successo',
      data: {
        messageId: result.messageId,
      },
    });
  } catch (err) {
    console.error('Errore nel test della configurazione email:', err);
    res.status(400).json({
      status: 'error',
      message: `Errore nel test della configurazione email: ${err.message}`,
    });
  }
};

export default {
  getAllEmailConfigs,
  getActiveEmailConfig,
  getEmailConfig,
  createEmailConfig,
  updateEmailConfig,
  deleteEmailConfig,
  activateEmailConfig,
  testEmailConfig
}