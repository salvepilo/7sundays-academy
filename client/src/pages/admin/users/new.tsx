import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { FiSave, FiX } from 'react-icons/fi';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  status: 'active' | 'inactive';
  subscriptionType: string;
  subscriptionEndDate: string;
}

export default function NewUser() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormData>();

  const password = watch('password');

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      // TODO: Implementare la chiamata API reale
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Errore nella creazione dell\'utente');

      toast.success('Utente creato con successo');
      router.push('/admin/users');
    } catch (error) {
      toast.error('Errore durante la creazione dell\'utente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nuovo Utente</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiX className="mr-2" />
            Annulla
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Informazioni Base</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input
                  type="text"
                  {...register('name', { required: 'Il nome è obbligatorio' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'L\'email è obbligatoria',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Indirizzo email non valido',
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'La password è obbligatoria',
                    minLength: {
                      value: 8,
                      message: 'La password deve essere di almeno 8 caratteri',
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Conferma Password</label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'La conferma della password è obbligatoria',
                    validate: value =>
                      value === password || 'Le password non coincidono',
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Ruolo e Stato</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ruolo</label>
                <select
                  {...register('role', { required: 'Il ruolo è obbligatorio' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Seleziona un ruolo</option>
                  <option value="admin">Amministratore</option>
                  <option value="instructor">Istruttore</option>
                  <option value="user">Utente</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stato</label>
                <select
                  {...register('status', { required: 'Lo stato è obbligatorio' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="active">Attivo</option>
                  <option value="inactive">Inattivo</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Abbonamento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo di Abbonamento</label>
                <select
                  {...register('subscriptionType')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Nessun abbonamento</option>
                  <option value="trial">Prova</option>
                  <option value="basic">Base</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data Fine Abbonamento</label>
                <input
                  type="date"
                  {...register('subscriptionEndDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FiSave className="mr-2" />
              {isLoading ? 'Salvataggio...' : 'Salva Utente'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}