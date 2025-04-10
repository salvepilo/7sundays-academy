# 7Sundays Academy

Piattaforma di e-learning per la gestione di corsi video con funzionalità avanzate di sicurezza, test e networking.

## Caratteristiche Principali

- **Sistema di Autenticazione**: Registrazione e login sicuri per utenti e amministratori
- **Gestione Corsi Video**: Upload, organizzazione e protezione dei contenuti video
- **Protezione Anti-registrazione**: Sistema di sicurezza per impedire la registrazione delle lezioni
- **Test con AI**: Integrazione con OpenAI per la creazione e valutazione dei test
- **Dashboard Amministrativa**: Monitoraggio dei progressi, punteggi e gestione utenti
- **Area Networking**: Contatti professionali disponibili per gli utenti che superano i test
- **Area "Lavora con Noi"**: Sezione esclusiva per chi ottiene il 100% nei test

## Struttura del Progetto

```
7Sundays Academy/
├── client/                 # Frontend (Next.js)
│   ├── public/             # Asset statici
│   └── src/                # Codice sorgente frontend
│       ├── components/     # Componenti riutilizzabili
│       ├── pages/          # Pagine dell'applicazione
│       ├── styles/         # Fogli di stile
│       └── utils/          # Utility e helper
├── server/                 # Backend (Node.js + Express)
│   ├── config/             # Configurazioni
│   ├── controllers/        # Controller
│   ├── middleware/         # Middleware
│   ├── models/             # Modelli dati
│   ├── routes/             # Definizione delle rotte API
│   └── utils/              # Utility e helper
└── .env                    # Variabili d'ambiente (non incluso nel repository)
```

## Tecnologie Utilizzate

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Autenticazione**: JWT, bcrypt
- **Storage**: AWS S3 (per i video)
- **AI**: OpenAI API
- **Sicurezza**: HTTPS, CORS, Helmet, Rate Limiting

## Funzionalità di Sicurezza

- Protezione contro la registrazione dei video
- Sistema di alert per tentativi di registrazione
- Autenticazione sicura con JWT
- Protezione contro attacchi comuni (XSS, CSRF, etc.)
- Rate limiting per prevenire abusi

## Installazione e Avvio

```bash
# Installazione dipendenze frontend
cd client
npm install

# Installazione dipendenze backend
cd ../server
npm install

# Avvio in modalità sviluppo
# Terminal 1 (Frontend)
cd client
npm run dev

# Terminal 2 (Backend)
cd server
npm run dev
```