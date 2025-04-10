import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  name: string;
  email: string;
}

const EditUserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User>({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        setIsLoading(true);    setError(null);
        const token = localStorage.getItem('token');
        const response = await axios.get<{ data: { user: User } }>(
          `/api/users/${id}`,
          {
          headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data.data.user);
        setFormData(response.data.data.user);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.response?.data?.message || 'Error fetching user');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/users/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('User updated successfully!');
      setTimeout(() => {
        router.push('/admin/dashboard/users');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Error updating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <div>Loading user...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        {error}
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
        {successMessage}
      </div>
    );
  }

  return (
    <div>
      <h1>Edit User</h1>
      {user && (
        <>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}/>
            </div>
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update User'}</button>
          </form>
        </>
      )}
    </div>
  );
};

export default EditUserPage;
