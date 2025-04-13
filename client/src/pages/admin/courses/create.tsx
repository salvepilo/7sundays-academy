import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layout/AdminLayout';
import { FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { createCourse } from '@/lib/api/courses';

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  level: string;
  requirements: string[];
  objectives: string[];
}

export default function CreateCourse() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: 0,
    thumbnail: '',
    category: '',
    level: 'beginner',
    requirements: [],
    objectives: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Aggiungi tutti i campi del form
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'requirements' || key === 'objectives') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      await createCourse(formDataToSend);
      toast.success('Corso creato con successo');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Errore durante la creazione del corso:', error);
      toast.error('Errore durante la creazione del corso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (type: 'requirements' | 'objectives', value: string) => {
    if (!value) {
      setFormData(prev => ({ ...prev, [type]: [] }));
      return;
    }
    const items = value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({ ...prev, [type]: items }));
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Crea Nuovo Corso</h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiX className="-ml-1 mr-2 h-5 w-5" />
            Annulla
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Titolo del Corso</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prezzo (€)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Seleziona una categoria</option>
                  <option value="web-development">Sviluppo Web</option>
                  <option value="mobile-development">Sviluppo Mobile</option>
                  <option value="data-science">Data Science</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Livello</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Immagine di Copertina</label>
                <input
                  type="text"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="URL dell'immagine"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Requisiti e Obiettivi</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Requisiti del Corso</label>
                <p className="text-sm text-gray-500 mb-2">Inserisci un requisito per riga</p>
                <textarea
                  value={formData.requirements.join('\n')}
                  onChange={(e) => handleListChange('requirements', e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Es:\nConoscenza base di HTML\nFamiliarità con JavaScript"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Obiettivi di Apprendimento</label>
                <p className="text-sm text-gray-500 mb-2">Inserisci un obiettivo per riga</p>
                <textarea
                  value={formData.objectives.join('\n')}
                  onChange={(e) => handleListChange('objectives', e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Es:\nCreare applicazioni web responsive\nUtilizzare le moderne tecniche di sviluppo"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FiSave className="-ml-1 mr-2 h-5 w-5" />
              {isLoading ? 'Creazione in corso...' : 'Crea Corso'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}