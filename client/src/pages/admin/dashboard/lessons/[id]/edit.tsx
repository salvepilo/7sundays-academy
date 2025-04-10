Procetsx
import { AdminLayout } from "@/components/layout/AdminLayout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

// Componenti
import AdminLayout from '@/components/layout/AdminLayout';

// Tipi
interface LessonData {
  title: string;
  videoUrls: string[];
  notes: { text: string; videoTimestamp: string }[];
}

const EditLessonPage: React.FC = () => {
  const router = useRouter();
  const { id, courseId } = router.query;
  const [lesson, setLesson] = useState<LessonData>({ title: "", videoUrls: [], notes: [] });
  const [notes, setNotes] = useState<{ text: string; videoTimestamp: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<LessonData>(`/api/lessons/${id}`);
        setLesson(response.data || { title: "", videoUrls: [], notes: []});
        setNotes(response.data.notes || []);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        setError('Si è verificato un errore durante il caricamento della lezione.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]); 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      //split videoUrls
      const urls = lesson.videoUrls.join(",").split(",").map(url => url.trim());

      await axios.put(`/api/lessons/${id}`, { ...lesson, videoUrls:urls ,notes });
      router.push(`/admin/dashboard/courses/${courseId}/lessons`);
    } catch (error) {
      console.error("Error updating lesson:", error);
      setError('Si è verificato un errore durante l\'aggiornamento della lezione.');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;    
    if (id === "notes") {
      return;
    }
      if (id === "videoUrls") {
          
        const urls = value.split(",").map(url => url.trim());
          setLesson({ ...lesson, [id]: urls });
      }
      else {
          setLesson({ ...lesson, [id]: value });
      }
  };
  
  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>{
    const { value } = event.target;
    setNotes([{text:value, videoTimestamp:""}]);
  }

  return (
    <AdminLayout>   
      {isLoading && (
        <div className="flex justify-center items-center h-full py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error &&(
          
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Lesson</h1>
      
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Title
            </label>
            <input
              type="text"              
              id="title"
              value={lesson.title}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Lesson Title"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="videoUrls"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Video URL
            </label>
            <input
              type="text"
              id="videoUrls"
              value={lesson.videoUrls.join(", ")}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="mb-4">
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={notes[0]?.text}
              onChange={handleNotesChange}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save Changes
          </button>
        </form>
      </div>
        )}
        
    </AdminLayout>
  );
};

export default EditLessonPage;