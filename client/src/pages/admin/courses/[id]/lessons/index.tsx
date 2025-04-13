import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layout/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiVideo, FiFile } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Material {
  id: string;
  title: string;
  fileUrl: string;
  type: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  materials: Material[];
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function LessonsManagement() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({});

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      // TODO: Implementare la chiamata API reale
      const response = await fetch(`/api/admin/courses/${id}`);
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      toast.error('Errore nel caricamento del corso');
      router.push('/admin/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonUpdate = async (updatedLesson: Lesson) => {
    if (!course) return;

    try {
      // TODO: Implementare la chiamata API reale
      await fetch(`/api/admin/courses/${id}/lessons/${updatedLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLesson),
      });

      setCourse({
        ...course,
        lessons: course.lessons.map(lesson =>
          lesson.id === updatedLesson.id ? updatedLesson : lesson
        ),
      });
      setSelectedLesson(null);
      setIsEditing(false);
      toast.success('Lezione aggiornata con successo');
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento della lezione');
    }
  };

  const handleAddMaterial = async (lessonId: string) => {
    if (!course || !newMaterial.title || !newMaterial.fileUrl) return;

    try {
      // TODO: Implementare la chiamata API reale
      const response = await fetch(`/api/admin/courses/${id}/lessons/${lessonId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });
      const data = await response.json();

      setCourse({
        ...course,
        lessons: course.lessons.map(lesson =>
          lesson.id === lessonId
            ? { ...lesson, materials: [...lesson.materials, data] }
            : lesson
        ),
      });
      setNewMaterial({});
      toast.success('Materiale aggiunto con successo');
    } catch (error) {
      toast.error('Errore durante l\'aggiunta del materiale');
    }
  };

  const handleDeleteMaterial = async (lessonId: string, materialId: string) => {
    if (!course || !window.confirm('Sei sicuro di voler eliminare questo materiale?')) return;

    try {
      // TODO: Implementare la chiamata API reale
      await fetch(`/api/admin/courses/${id}/lessons/${lessonId}/materials/${materialId}`, {
        method: 'DELETE',
      });

      setCourse({
        ...course,
        lessons: course.lessons.map(lesson =>
          lesson.id === lessonId
            ? { ...lesson, materials: lesson.materials.filter(m => m.id !== materialId) }
            : lesson
        ),
      });
      toast.success('Materiale eliminato con successo');
    } catch (error) {
      toast.error('Errore durante l\'eliminazione del materiale');
    }
  };

  const handleReorderLessons = async (lessonId: string, direction: 'up' | 'down') => {
    if (!course) return;

    const currentIndex = course.lessons.findIndex(lesson => lesson.id === lessonId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= course.lessons.length) return;

    const newLessons = [...course.lessons];
    [newLessons[currentIndex], newLessons[newIndex]] = [newLessons[newIndex], newLessons[currentIndex]];

    try {
      // TODO: Implementare la chiamata API reale
      await fetch(`/api/admin/courses/${id}/lessons/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessons: newLessons.map((lesson, index) => ({
            id: lesson.id,
            order: index + 1,
          })),
        }),
      });

      setCourse({ ...course, lessons: newLessons });
      toast.success('Ordine delle lezioni aggiornato');
    } catch (error) {
      toast.error('Errore durante il riordinamento delle lezioni');
    }
  };

  if (isLoading || !course) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestione Lezioni: {course.title}
          </h1>
          <button
            onClick={() => router.push(`/admin/courses/${id}/lessons/create`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Nuova Lezione
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {course.lessons.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nessuna lezione disponibile. Aggiungi la tua prima lezione!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {course.lessons.map((lesson, index) => (
                <div key={lesson.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-medium text-gray-900">
                        Lezione {index + 1}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReorderLessons(lesson.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                      >
                        <FiArrowUp className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReorderLessons(lesson.id, 'down')}
                        disabled={index === course.lessons.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                      >
                        <FiArrowDown className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setIsEditing(true);
                        }}
                        className="p-2 text-indigo-600 hover:text-indigo-900"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{lesson.description}</p>
                  </div>

                  {lesson.videoUrl && (
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <FiVideo className="mr-2 h-4 w-4" />
                      Video della lezione disponibile
                    </div>
                  )}

                  {lesson.materials.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Materiali</h4>
                      <div className="mt-2 space-y-2">
                        {lesson.materials.map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center">
                              <FiFile className="mr-2 h-4 w-4 text-gray-400" />
                              <span>{material.title}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteMaterial(lesson.id, material.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal per la modifica della lezione */}
      {isEditing && selectedLesson && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Modifica Lezione</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLessonUpdate(selectedLesson);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Titolo</label>
                <input
                  type="text"
                  value={selectedLesson.title}
                  onChange={(e) =>
                    setSelectedLesson({ ...selectedLesson, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                <textarea
                  value={selectedLesson.description}
                  onChange={(e) =>
                    setSelectedLesson({ ...selectedLesson, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">URL Video</label>
                <input
                  type="text"
                  value={selectedLesson.videoUrl}
                  onChange={(e) =>
                    setSelectedLesson({ ...selectedLesson, videoUrl: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLesson(null);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}