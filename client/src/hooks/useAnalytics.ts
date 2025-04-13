import { useState, useEffect } from 'react';
import axios from 'axios';

interface AnalyticsData {
  totalRevenue: number;
  totalEnrollments: number;
  totalCourses: number;
  totalStudents: number;
  courseGrowth: number;
  studentGrowth: number;
  revenueGrowth: number;
  completionRate: number;
  completionGrowth: number;
  enrollmentTrends: Array<{
    date: string;
    count: number;
  }>;
  revenueTrends: Array<{
    date: string;
    amount: number;
  }>;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/analytics');
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Errore nel caricamento delle analisi');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, loading, error };
}; 