import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';

// Tipo per la configurazione email
interface EmailConfig {
  _id: string;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass?: string;
  };
  defaultFrom: string;
  defaultReplyTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipo per il form di configurazione email
interface EmailConfigForm {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  defaultFrom: string;
  defaultReplyTo: string;
  isActive: boolean;
}

// Stato iniziale del form
const initialFormState: EmailConfigForm = {
  host: '',
  port: 587,
  secure: false,
  auth: {
    user: '',
    pass: '',
  },
  defaultFrom: '',
  defaultReplyTo: '',
  isActive: true,
};

const EmailSettingsPage = () => {
  const router = useRouter();
  const [configs, setConfigs] = useState<EmailConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmailConfigForm>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openTestDialog, setOpenTestDialog] = useState<boolean>(false);
  const [testEmail, setTestEmail] = useState<string>('');
  const [testingConfig, setTestingConfig] = useState<EmailConfigForm | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info'}>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  // Carica le configurazioni email
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-config');
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle configurazioni email');
      }
      const data = await response.json();
      setConfigs(data.data.configs);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento delle configurazioni email');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carica le configurazioni all'avvio
  useEffect(() => {
    fetchConfigs();
  }, []);

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'auth.user' || name === 'auth.pass') {
      const field = name.split('.');
      setFormData(prev => ({
        ...prev,
        auth: {
          ...prev.auth,
          [field[1]]: value
        }
      }));
    } else if (name === 'secure') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'port') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Apre il form per la modifica
  const handleEdit = (config: EmailConfig) => {
    setFormData({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: '', // La password non viene mai restituita dall'API
      },
      defaultFrom: config.defaultFrom,
      defaultReplyTo: config.defaultReplyTo || '',
      isActive: config.isActive,
    });
    setEditingId(config._id);
  };

  // Apre il form per una nuova configurazione
  const handleNew = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  // Conferma l'eliminazione di una configurazione
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/email-config/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della configurazione');
      }
      
      setSnackbar({
        open: true,
        message: 'Configurazione eliminata con successo',
        severity: 'success'
      });
      
      fetchConfigs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Errore nell\'eliminazione della configurazione',
        severity: 'error'
      });
      console.error(err);
    } finally {
      setOpenDialog(false);
      setDeleteId(null);
    }
  };

  // Attiva una configurazione
  const handleActivate = async (id: string) => {
    try {
      const response = await fetch(`/api/email-config/${id}/activate`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Errore nell\'attivazione della configurazione');
      }
      
      setSnackbar({
        open: true,
        message: 'Configurazione attivata con successo',
        severity: 'success'
      });
      
      fetchConfigs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Errore nell\'attivazione della configurazione',
        severity: 'error'
      });
      console.error(err);
    }
  };

  // Invia il form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione base
    if (!formData.host || !formData.port || !formData.auth.user || !formData.defaultFrom) {
      setSnackbar({
        open: true,
        message: 'Compila tutti i campi obbligatori',
        severity: 'error'
      });
      return;
    }
    
    // Se stiamo modificando e non è stata inserita una password, rimuoviamola dalla richiesta
    const dataToSend = { ...formData };
    if (editingId && !dataToSend.auth.pass) {
      delete dataToSend.auth.pass;
    }
    
    try {
      const url = editingId 
        ? `/api/email-config/${editingId}`
        : '/api/email-config';
      
      const method = editingId ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nel salvataggio della configurazione');
      }
      
      setSnackbar({
        open: true,
        message: `Configurazione ${editingId ? 'aggiornata' : 'creata'} con successo`,
        severity: 'success'
      });
      
      setFormData(initialFormState);
      setEditingId(null);
      fetchConfigs();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Errore nel salvataggio della configurazione',
        severity: 'error'
      });
      console.error(err);
    }
  };

  // Apre il dialog per il test
  const handleOpenTestDialog = (config: EmailConfig) => {
    setTestingConfig({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: '', // La password non viene mai restituita dall'API
      },
      defaultFrom: config.defaultFrom,
      defaultReplyTo: config.defaultReplyTo || '',
      isActive: config.isActive,
    });
    setOpenTestDialog(true);
  };

  // Invia l'email di test
  const handleSendTest = async () => {
    if (!testingConfig || !testEmail) return;
    
    try {
      const response = await fetch('/api/email-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testingConfig,
          testEmail,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nell\'invio dell\'email di test');
      }
      
      setSnackbar({
        open: true,
        message: 'Email di test inviata con successo',
        severity: 'success'
      });
      
      setOpenTestDialog(false);
      setTestEmail('');
      setTestingConfig(null);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Errore nell\'invio dell\'email di test',
        severity: 'error'
      });
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Configurazioni Email SMTP
        </Typography>
        
        <Grid container spacing={3}>
          {/* Lista delle configurazioni */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardHeader 
                title="Configurazioni disponibili" 
                action={
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNew}
                  >
                    Nuova configurazione
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : configs.length === 0 ? (
                  <Alert severity="info">
                    Nessuna configurazione email trovata. Crea la tua prima configurazione.
                  </Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Server</TableCell>
                          <TableCell>Utente</TableCell>
                          <TableCell>Mittente</TableCell>
                          <TableCell>Stato</TableCell>
                          <TableCell align="right">Azioni</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {configs.map((config) => (
                          <TableRow key={config._id}>
                            <TableCell>
                              {config.host}:{config.port}
                              {config.secure && ' (SSL)'}
                            </TableCell>
                            <TableCell>{config.auth.user}</TableCell>
                            <TableCell>{config.defaultFrom}</TableCell>
                            <TableCell>
                              {config.isActive ? (
                                <Typography color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  Attiva
                                </Typography>
                              ) : (
                                <Typography color="text.secondary">
                                  Inattiva
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                color="primary" 
                                onClick={() => handleEdit(config)}
                                title="Modifica"
                              >
                                <EditIcon />
                              </IconButton>
                              {!config.isActive && (
                                <IconButton 
                                  color="success" 
                                  onClick={() => handleActivate(config._id)}
                                  title="Attiva"
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              )}
                              <IconButton 
                                color="info" 
                                onClick={() => handleOpenTestDialog(config)}
                                title="Test"
                              >
                                <SendIcon />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => {
                                  setDeleteId(config._id);
                                  setOpenDialog(true);
                                }}
                                title="Elimina"
                                disabled={config.isActive}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Form di modifica/creazione */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardHeader title={editingId ? 'Modifica configurazione' : 'Nuova configurazione'} />
              <Divider />
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Server SMTP"
                        name="host"
                        value={formData.host}
                        onChange={handleChange}
                        required
                        helperText="Es. smtp.gmail.com"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Porta"
                        name="port"
                        type="number"
                        value={formData.port}
                        onChange={handleChange}
                        required
                        helperText="Es. 587 o 465"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.secure}
                            onChange={handleChange}
                            name="secure"
                          />
                        }
                        label="Connessione sicura (SSL/TLS)"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="auth.user"
                        value={formData.auth.user}
                        onChange={handleChange}
                        required
                        helperText="Email o username per l'autenticazione"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="auth.pass"
                        type="password"
                        value={formData.auth.pass}
                        onChange={handleChange}
                        required={!editingId}
                        helperText={editingId ? 'Lascia vuoto per mantenere la password attuale' : 'Password per l\'autenticazione'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Indirizzo mittente predefinito"
                        name="defaultFrom"
                        value={formData.defaultFrom}
                        onChange={handleChange}
                        required
                        helperText="Es. 'Nome <email@dominio.com>' o solo 'email@dominio.com'"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Indirizzo di risposta predefinito"
                        name="defaultReplyTo"
                        value={formData.defaultReplyTo}
                        onChange={handleChange}
                        helperText="Opzionale. Se non specificato, verrà usato l'indirizzo mittente"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleChange}
                            name="isActive"
                          />
                        }
                        label="Attiva questa configurazione"
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                      >
                        {editingId ? 'Aggiorna configurazione' : 'Crea configurazione'}
                      </Button>
                    </Grid>
                    {editingId && (
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => {
                            setFormData(initialFormState);
                            setEditingId(null);
                          }}
                        >
                          Annulla
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Dialog di conferma eliminazione */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare questa configurazione email? Questa azione non può essere annullata.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annulla</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per il test email */}
      <Dialog
        open={openTestDialog}
        onClose={() => setOpenTestDialog(false)}
      >
        <DialogTitle>Invia email di test</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Inserisci l'indirizzo email a cui inviare il messaggio di test.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Indirizzo email"
            type="email"
            fullWidth
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            required
          />
          {testingConfig && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Configurazione da testare:</Typography>
              <Typography variant="body2">
                Server: {testingConfig.host}:{testingConfig.port}{testingConfig.secure ? ' (SSL)' : ''}
              </Typography>
              <Typography variant="body2">
                Utente: {testingConfig.auth.user}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Mittente: {testingConfig.defaultFrom}
              </Typography>
              <TextField
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                value={testingConfig.auth.pass}
                onChange={(e) => setTestingConfig(prev => prev ? {
                  ...prev,
                  auth: {
                    ...prev.auth,
                    pass: e.target.value
                  }
                } : null)}
                required
                helperText="Inserisci la password per il test"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>Annulla</Button>
          <Button 
            onClick={handleSendTest} 
            color="primary" 
            disabled={!testEmail || !testingConfig || !testingConfig.auth.pass}
          >
            Invia test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar per i messaggi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default EmailSettingsPage;