import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/styles/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
const ToastProvider = dynamic(() => import('@/components/layout/ToastProvider'), { ssr: false });
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Funzione per rilevare tentativi di registrazione dello schermo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Rileva tentativi di registrazione dello schermo
      const detectScreenCapture = () => {
        if (document.pictureInPictureElement) {
          // Blocca Picture-in-Picture che può essere usato per registrare
          document.exitPictureInPicture().catch(err => console.error(err));
          
          // Mostra un alert
          alert('La registrazione dello schermo non è consentita. Il tuo accesso potrebbe essere bloccato.');
          
          // Qui si potrebbe implementare un sistema per segnalare l'amministratore
          // o bloccare temporaneamente l'accesso dell'utente
        }
      };

      // Controlla periodicamente
      const intervalId = setInterval(detectScreenCapture, 1000);

      // Blocca scorciatoie da tastiera comuni per screenshot e registrazione
      const blockShortcuts = (e: KeyboardEvent) => {
        // Combinazioni comuni per screenshot e registrazione
        if (
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c')) ||
          (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) ||
          (e.key === 'PrintScreen')
        ) {
          e.preventDefault();
          alert('Gli screenshot non sono consentiti per proteggere il contenuto del corso.');
          return false;
        }
      };

      document.addEventListener('keydown', blockShortcuts);

      return () => {
        clearInterval(intervalId);
        document.removeEventListener('keydown', blockShortcuts);
      };
    }
  }, [router.pathname]);

  return (
    <ThemeProvider theme={theme}>
        <AuthProvider>
            <Component {...pageProps} />
            <ToastProvider />
        </AuthProvider>
    </ThemeProvider>
  );
}