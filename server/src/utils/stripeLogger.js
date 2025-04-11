import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StripeLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.logFile = path.join(this.logDir, 'stripe-transactions.log');
    this.ensureLogDirectoryExists();
  }

  ensureLogDirectoryExists() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatLogMessage(type, data) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${type}: ${JSON.stringify(data)}\n`;
  }

  async logTransaction(type, data) {
    try {
      const logMessage = this.formatLogMessage(type, data);
      await fs.promises.appendFile(this.logFile, logMessage);
    } catch (error) {
      console.error('Errore durante il logging della transazione:', error);
    }
  }

  async logPaymentSuccess(session) {
    await this.logTransaction('PAYMENT_SUCCESS', {
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
      metadata: session.metadata
    });
  }

  async logPaymentFailure(error, sessionId) {
    await this.logTransaction('PAYMENT_FAILURE', {
      sessionId,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }

  async logWebhookEvent(event) {
    await this.logTransaction('WEBHOOK_EVENT', {
      type: event.type,
      id: event.id,
      created: event.created,
      data: event.data.object
    });
  }

  async getRecentTransactions(limit = 100) {
    try {
      const fileContent = await fs.promises.readFile(this.logFile, 'utf8');
      return fileContent
        .split('\n')
        .filter(Boolean)
        .slice(-limit)
        .map(line => {
          try {
            const [timestamp, type, data] = line.match(/\[(.*?)\] (.*?): (.*)/).slice(1);
            return { timestamp, type, data: JSON.parse(data) };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Errore durante la lettura delle transazioni:', error);
      return [];
    }
  }
}

export default new StripeLogger();