import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';

// Componenti
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export default function Register() {
  const { register: registerUser, error, loading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const password = watch('password', '');

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      return;
    }
    
    await registerUser(data.name, data.email, data.password);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Registrati - 7Sundays Academy</title>
        <meta name="description" content="Crea un nuovo account su 7Sundays Academy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar isScrolled={true} />

      <main className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crea un nuovo account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Oppure{' '}
              <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                accedi se hai già un account
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Nome e Cognome"
                  {...register('name', { 
                    required: 'Il nome è obbligatorio',
                    minLength: {
                      value: 2,
                      message: 'Il nome deve contenere almeno 2 caratteri'
                    }
                  })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="email@esempio.com"
                  {...register('email', { 
                    required: 'L\'email è obbligatoria',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Indirizzo email non valido'
                    }
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              
              <div className="mb-4 relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  {...register('password', { 
                    required: 'La password è obbligatoria',
                    minLength: {
                      value: 8,
                      message: 'La password deve contenere almeno 8 caratteri'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
                      message: 'La password deve contenere almeno una lettera maiuscola, una minuscola e un numero'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 top-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Conferma Password</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Conferma Password"
                  {...register('confirmPassword', { 
                    required: 'La conferma della password è obbligatoria',
                    validate: value => value === password || 'Le password non corrispondono'
                  })}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${errors.terms ? 'border-red-300' : ''}`}
                {...register('terms', { 
                  required: 'Devi accettare i termini e le condizioni'
                })}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Accetto i <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500">Termini e Condizioni</Link> e la <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Registrati
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}