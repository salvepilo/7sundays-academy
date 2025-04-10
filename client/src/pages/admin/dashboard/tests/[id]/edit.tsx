import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from '@/components/layout/AdminLayout';

const EditTestPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [testData, setTestData] = useState<{ title: string } | null>(null);
    const [formData, setFormData] = useState<{ title: string }>({
      title: "",
    });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5001/api/tests/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data.data.test;
        setTestData(data);
        setFormData({ title: data.title });
      } catch (err: any) {
        console.error("Error fetching test data:", err);
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching test data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5001/api/tests/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("Test updated successfully!");

      // Reindirizza alla lista dei corsi dopo 2 secondi
      setTimeout(() => {
        router.push("/admin/dashboard/tests");
      }, 2000);
    } catch (err: any) {
      console.error("Error updating test:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while updating test data"
      );
    }
  };

  if (isLoading) {

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-full py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
        </div>
      ) : (
        <div>
          <h1>Edit test</h1>
          {id && <p>Test ID: {id}</p>}
          {testData && <p>Test Title: {testData.title}</p>}
        </div>
      )}
    </AdminLayout>
  );
};

export default EditTestPage;