import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiUpload, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '@/components/layouts/AdminLayout';

interface FormData {
  title: string;
  description: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: File | null;
  duration: string;
  requirements: string[];
  learningObjectives: string[];
  sections: {
    title: string;
    lessons: {
      title: string;
      description: string;
      videoUrl: string;
      duration: string;
      isFree: boolean;
      resources: {
        title: string;
        type: 'pdf' | 'link' | 'code';
        url: string;
      }[];
    }[];
  }[];
}

const CreateCourse: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    level: 'beginner',
    thumbnail: null,
    duration: '',
    requirements: [''],
    learningObjectives: [''],
    sections: [{
      title: '',
      lessons: [{
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        isFree: false,
        resources: []
      }]
    }]
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, thumbnail: e.target.files[0] });
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    setFormData({ ...formData, learningObjectives: newObjectives });
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      learningObjectives: [...formData.learningObjectives, '']
    });
  };

  const removeObjective = (index: number) => {
    const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
    setFormData({ ...formData, learningObjectives: newObjectives });
  };

  const handleSectionChange = (index: number, value: string) => {
    const newSections = [...formData.sections];
    newSections[index].title = value;
    setFormData({ ...formData, sections: newSections });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, {
        title: '',
        lessons: [{
          title: '',
          description: '',
          videoUrl: '',
          duration: '',
          isFree: false,
          resources: []
        }]
      }]
    });
  };

  const removeSection = (index: number) => {
    const newSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: newSections });
  };

  const handleLessonChange = (sectionIndex: number, lessonIndex: number, field: string, value: any) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].lessons[lessonIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const addLesson = (sectionIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].lessons.push({
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      isFree: false,
      resources: []
    });
    setFormData({ ...formData, sections: newSections });
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].lessons = newSections[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData({ ...formData, sections: newSections });
  };

  const addResource = (sectionIndex: number, lessonIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].lessons[lessonIndex].resources.push({
      title: '',
      type: 'pdf',
      url: ''
    });
    setFormData({ ...formData, sections: newSections });
  };

  const removeResource = (sectionIndex: number, lessonIndex: number, resourceIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].lessons[lessonIndex].resources = 
      newSections[sectionIndex].lessons[lessonIndex].resources.filter((_, i) => i !== resourceIndex);
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'thumbnail' && formData[key]) {
          formDataToSend.append('thumbnail', formData[key]);
        } else if (key === 'sections' || key === 'requirements' || key === 'learningObjectives') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key].toString());
        }
      });

      await axios.post('/api/courses', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Corso creato con successo!');
      router.push('/admin/dashboard/courses');
    } catch (error) {
      console.error('Errore nella creazione del corso:', error);
      toast.error('Errore nella creazione del corso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Crea Nuovo Corso</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informazioni Base */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Informazioni Base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo del Corso
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                >
                  <option value="">Seleziona categoria</option>
                  <option value="programming">Programmazione</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prezzo (€)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-md"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Livello
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzato</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durata Totale
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="es. 10h 30m"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    id="thumbnail"
                    accept="image/*"
                  />
                  <label
                    htmlFor="thumbnail"
                    className="flex items-center px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
                  >
                    <FiUpload className="mr-2" />
                    {formData.thumbnail ? 'Cambia immagine' : 'Carica immagine'}
                  </label>
                  {formData.thumbnail && (
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.thumbnail.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Requisiti */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Requisiti</h2>
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md mr-2"
                  placeholder="Aggiungi un requisito"
                />
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiPlus className="mr-1" /> Aggiungi requisito
            </button>
          </div>

          {/* Obiettivi di Apprendimento */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Obiettivi di Apprendimento</h2>
            {formData.learningObjectives.map((obj, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={obj}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md mr-2"
                  placeholder="Aggiungi un obiettivo"
                />
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addObjective}
              className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiPlus className="mr-1" /> Aggiungi obiettivo
            </button>
          </div>

          {/* Sezioni e Lezioni */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Sezioni e Lezioni</h2>
            {formData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6 p-4 border rounded-lg">
                <div className="flex items-center mb-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(sectionIndex, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-md mr-2"
                    placeholder="Titolo della sezione"
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                {/* Lezioni */}
                {section.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="ml-4 mb-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'title', e.target.value)}
                        className="px-4 py-2 border rounded-md"
                        placeholder="Titolo della lezione"
                      />
                      <input
                        type="text"
                        value={lesson.videoUrl}
                        onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'videoUrl', e.target.value)}
                        className="px-4 py-2 border rounded-md"
                        placeholder="URL del video"
                      />
                      <input
                        type="text"
                        value={lesson.duration}
                        onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'duration', e.target.value)}
                        className="px-4 py-2 border rounded-md"
                        placeholder="Durata (es. 15:30)"
                      />
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={lesson.isFree}
                          onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'isFree', e.target.checked)}
                          className="mr-2"
                        />
                        <label>Lezione gratuita</label>
                      </div>
                      <div className="md:col-span-2">
                        <textarea
                          value={lesson.description}
                          onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'description', e.target.value)}
                          className="w-full px-4 py-2 border rounded-md"
                          placeholder="Descrizione della lezione"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Risorse della lezione */}
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Risorse</h4>
                      {lesson.resources.map((resource, resourceIndex) => (
                        <div key={resourceIndex} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={resource.title}
                            onChange={(e) => {
                              const newSections = [...formData.sections];
                              newSections[sectionIndex].lessons[lessonIndex].resources[resourceIndex].title = e.target.value;
                              setFormData({ ...formData, sections: newSections });
                            }}
                            className="flex-1 px-4 py-2 border rounded-md"
                            placeholder="Titolo della risorsa"
                          />
                          <select
                            value={resource.type}
                            onChange={(e) => {
                              const newSections = [...formData.sections];
                              newSections[sectionIndex].lessons[lessonIndex].resources[resourceIndex].type = e.target.value as 'pdf' | 'link' | 'code';
                              setFormData({ ...formData, sections: newSections });
                            }}
                            className="px-4 py-2 border rounded-md"
                          >
                            <option value="pdf">PDF</option>
                            <option value="link">Link</option>
                            <option value="code">Codice</option>
                          </select>
                          <input
                            type="text"
                            value={resource.url}
                            onChange={(e) => {
                              const newSections = [...formData.sections];
                              newSections[sectionIndex].lessons[lessonIndex].resources[resourceIndex].url = e.target.value;
                              setFormData({ ...formData, sections: newSections });
                            }}
                            className="flex-1 px-4 py-2 border rounded-md"
                            placeholder="URL della risorsa"
                          />
                          <button
                            type="button"
                            onClick={() => removeResource(sectionIndex, lessonIndex, resourceIndex)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addResource(sectionIndex, lessonIndex)}
                        className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FiPlus className="mr-1" /> Aggiungi risorsa
                      </button>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeLesson(sectionIndex, lessonIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addLesson(sectionIndex)}
                  className="ml-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FiPlus className="mr-1" /> Aggiungi lezione
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSection}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiPlus className="mr-1" /> Aggiungi sezione
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creazione in corso...' : 'Crea Corso'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateCourse;

