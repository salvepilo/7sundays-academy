import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  recentCourses: any[];
  recentUsers: any[];
  enrollmentStats: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  revenueStats: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get(`${API_URL}/stats/dashboard`);
  return response.data;
}; 