const mongoose = require('mongoose');

/**
 * Schema per la configurazione delle email SMTP
 * Questo modello memorizza le impostazioni per l'invio di email
 */
const emailConfigSchema = new mongoose.Schema(
  {
    host: {
      type: String,
      required: [true, 'Il server SMTP è obbligatorio'],
      trim: true,
    },
    port: {
      type: Number,
      required: [true, 'La porta SMTP è obbligatoria'],
      default: 587,
    },
    secure: {
      type: Boolean,
      default: false,
    },
    auth: {
      user: {
        type: String,
        required: [true, "L'username è obbligatorio"],
        trim: true,
      },
      pass: {
        type: String,
        required: [true, 'La password è obbligatoria'],
        trim: true,
        select: false, // Non include la password nelle query
      },
    },
    defaultFrom: {
      type: String,
      required: [true, "L'indirizzo mittente è obbligatorio"],
      trim: true,
    },
    defaultReplyTo: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware per garantire che ci sia solo una configurazione attiva
emailConfigSchema.pre('save', async function (next) {
  if (this.isActive) {
    // Disattiva tutte le altre configurazioni
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const EmailConfig = mongoose.model('EmailConfig', emailConfigSchema);

module.exports = EmailConfig;