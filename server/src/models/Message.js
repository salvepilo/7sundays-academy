const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il mittente è obbligatorio'],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il destinatario è obbligatorio'],
    },
    content: {
      type: String,
      required: [true, 'Il contenuto del messaggio è obbligatorio'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indice per trovare rapidamente i messaggi di una conversazione
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ createdAt: -1 });

// Metodo statico per contare i messaggi non letti per un utente
messageSchema.statics.countUnreadMessages = async function(userId) {
  return await this.countDocuments({ 
    recipient: userId,
    read: false
  });
};

// Metodo statico per marcare tutti i messaggi di una conversazione come letti
messageSchema.statics.markConversationAsRead = async function(userId, contactId) {
  return await this.updateMany(
    { 
      sender: contactId,
      recipient: userId,
      read: false
    },
    { read: true }
  );
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;