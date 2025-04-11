import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
const ToastProvider = dynamic(() => import('@/components/layout/ToastProvider'), { ssr: false });
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>7Sundays Academy</title>
            </Head>            
                <AuthProvider>
                    <Component {...pageProps} />
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                style: {
                                    background: '#22c55e',
                                },
                            },
                            error: {
                                duration: 5000,
                                style: {
                                    background: '#ef4444',
                                },
                            },
                        }}
                    />
                </AuthProvider>
        </>
    );
}