import { useState, useEffect } from 'react';
import axios from 'axios';

interface Payment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
  };
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  method: 'stripe' | 'other';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments');
      setPayments(response.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Errore nel caricamento dei pagamenti');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData: {
    studentId: string;
    courseId: string;
    amount: number;
    currency: string;
    method: 'stripe' | 'other';
  }) => {
    try {
      const response = await axios.post('/api/payments', paymentData);
      setPayments((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  };

  const updatePayment = async (id: string, paymentData: Partial<Payment>) => {
    try {
      const response = await axios.put(`/api/payments/${id}`, paymentData);
      setPayments((prev) =>
        prev.map((payment) => (payment._id === id ? response.data : payment))
      );
      return response.data;
    } catch (err) {
      console.error('Error updating payment:', err);
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await axios.delete(`/api/payments/${id}`);
      setPayments((prev) => prev.filter((payment) => payment._id !== id));
    } catch (err) {
      console.error('Error deleting payment:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
    refetch: fetchPayments,
  };
}; 