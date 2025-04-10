import { useRouter } from "next/router";
import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useState } from "react";
import axios from "axios";

const EditNetworkingContactPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState<any>({
    name: "",
    company: "",
    position: "",
    category: "",
    skills: [""],
    location: "",
    bio: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
      const fetchContact = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.get<{ data: { contact: { name: string} } }>(
          `http://localhost:5001/api/networking/contacts/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const contactData = response.data.data.contact;
        setFormData({
            name: contactData.name || '',
            company: contactData.company || '',
            position: contactData.position || '',
            category: contactData.category || '',
            skills: contactData.skills || [],
            location: contactData.location || '',
            bio: contactData.bio || ''
        });
      } catch (err: any) {
        console.error("Error fetching contact:", err);
        setError(err.response?.data?.message || "Error fetching contact");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev,[name]: value}))
  };
  
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    setFormData(prev => {
      const newSkills = [...prev.skills];
      newSkills[index] = value;
      return {...prev, skills: newSkills};
    });
  };

  const addSkill = () => {
    setFormData(prev => ({...prev, skills: [...prev.skills, ""]}));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({...prev, skills: prev.skills.filter((_, i) => i !== index)}));
  };

  // Gestisce l'invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!id) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `http://localhost:5001/api/networking/contacts/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccessMessage('Contatto aggiornato con successo!');
      
      setTimeout(() => {
        router.push('/admin/dashboard/networking');
      }, 2000);
    } catch (err: any) {
        setError(err.response?.data?.message || 'Si è verificato un errore durante l\'aggiornamento del contatto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit networking contact</h1>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-full py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

          {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && ( <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nome</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'/>
          </div>
          <div className="mb-6">
            <label htmlFor="company" className="block text-gray-700 text-sm font-bold mb-2">Company</label>
            <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'/>
          </div>
          <div className="mb-6">
            <label htmlFor="position" className="block text-gray-700 text-sm font-bold mb-2">Position</label>
            <input type="text" id="position" name="position" value={formData.position} onChange={handleChange} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'/>
          </div>
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'/>
          </div>
          <div className="mb-6">
            <label htmlFor="skills" className="block text-gray-700 text-sm font-bold mb-2">Skills</label>
            {formData.skills.map((skill:string, index:number) => (
                <div key={index} className="flex mb-2">
                  <input type="text" id="skills" name="skills" value={skill} onChange={(e) => handleSkillsChange(e, index)} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'/>
                  <button type="button" onClick={() => removeSkill(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2 focus:outline-none focus:shadow-outline">
                    Remove
                  </button>
                </div>
              ))}
            <button type="button" onClick={addSkill} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Add Skill
            </button>
          </div>
          <div className="mb-6">
            <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location</label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'/>
          </div>
          <div className="mb-6">
            <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">Bio</label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'/>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard/networking')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Updating...' : 'Update Contact'}
            </button>
          </div>
        </form>)}
      </div>
    </AdminLayout>
  );
};

export default EditNetworkingContactPage;