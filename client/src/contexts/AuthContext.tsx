import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

// URL base del server
const API_BASE_URL = 'http://localhost:5001';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  completedCourses?: string[];
  testScores?: Record<string, number>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Configura axios con la gestione dei token
const setupAxiosInterceptors = () => {
  // Interceptor per aggiungere il token a ogni richiesta
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor per gestire gli errori di risposta (es. token scaduti)
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token non valido o scaduto
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }
  );
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Configura axios una volta all'avvio
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  // Verifica il token all'avvio
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Verifica se il token è scaduto
        const decodedToken: any = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token scaduto
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }

        // Token valido, ottieni i dati dell'utente
        try {
          // Usa l'URL completo
          const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.data) {
            setUser(response.data.data);
          }
        } catch (err) {
          console.error('Errore nel recupero dati utente:', err);
          // Se il recupero dati fallisce, rimuovi il token
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Errore nella verifica del token:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Usa l'URL completo
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('Token non trovato nella risposta');
      }
      
      localStorage.setItem('token', token);
      setUser(user);
      
      // Reindirizza in base al ruolo
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Errore login:', err);
      
      // Gestione dettagliata degli errori
      if (err.response) {
        // La richiesta è stata effettuata e il server ha risposto con un codice di stato
        // che non rientra nell'intervallo 2xx
        setError(err.response.data?.message || `Errore ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        // La richiesta è stata effettuata ma non è stata ricevuta alcuna risposta
        setError('Il server non risponde. Riprova più tardi.');
      } else {
        // Si è verificato un errore durante l'impostazione della richiesta
        setError(err.message || 'Errore imprevisto durante il login');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Invio richiesta di registrazione a:', `${API_BASE_URL}/api/auth/signup`);
      console.log('Dati:', { name, email, password: '***********' });
      
      // Usa l'URL completo
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, { 
        name, 
        email, 
        password 
      });
      
      console.log('Risposta registrazione:', response.data);
      
      // Se la registrazione è andata a buon fine, effettua il login automatico
      if (response.data && response.data.status === 'success') {
        await login(email, password);
      } else {
        // Se la registrazione non ha successo, imposta l'errore
        setError(response.data?.message || 'Errore nella registrazione.');
      }
    } catch (err: any) {
      console.error('Errore registrazione:', err);
      if(err.response && !err.response.data.token){
        setError(err.response.data?.message || `Errore ${err.response.status}: ${err.response.statusText}`);
      }
      // Gestione dettagliata degli errori
      else if (err.response) {
        
        // La richiesta è stata effettuata e il server ha risposto con un codice di stato
        // che non rientra nell'intervallo 2xx
        setError(err.response.data?.message || `Errore ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        // La richiesta è stata effettuata ma non è stata ricevuta alcuna risposta
        setError('Il server non risponde. Verifica la connessione e riprova.');
      } else {
        // Si è verificato un errore durante l'impostazione della richiesta
        setError(err.message || 'Errore imprevisto durante la registrazione');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};