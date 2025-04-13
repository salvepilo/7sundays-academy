import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/ui/StatsCard';
import { Chart } from '@/components/ui/Chart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useCourses } from '@/hooks/useCourses';
import { useUsers } from '@/hooks/useUsers';
import { useEnrollments } from '@/hooks/useEnrollments';
import { usePayments } from '@/hooks/usePayments';
import { formatCurrency } from '@/lib/utils';

export const StatsOverview = () => {
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { courses, loading: coursesLoading } = useCourses();
  const { users, loading: usersLoading } = useUsers();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const { payments, loading: paymentsLoading } = usePayments();

  const [timeRange, setTimeRange] = useState('month');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (analytics) {
      const data = {
        labels: analytics.enrollmentTrends.map((item: any) => item.date),
        datasets: [
          {
            label: 'Iscrizioni',
            data: analytics.enrollmentTrends.map((item: any) => item.count),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Revenue',
            data: analytics.revenueTrends.map((item: any) => item.amount),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      };
      setChartData(data);
    }
  }, [analytics]);

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const loading = analyticsLoading || coursesLoading || usersLoading || enrollmentsLoading || paymentsLoading;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Corsi Totali"
          value={courses?.length || 0}
          icon="book"
          trend={analytics?.courseGrowth || 0}
          trendLabel="rispetto al mese scorso"
        />
        <StatsCard
          title="Studenti Totali"
          value={users?.filter((u: any) => u.role === 'student').length || 0}
          icon="users"
          trend={analytics?.studentGrowth || 0}
          trendLabel="rispetto al mese scorso"
        />
        <StatsCard
          title="Revenue Totale"
          value={formatCurrency(analytics?.totalRevenue || 0)}
          icon="dollar"
          trend={analytics?.revenueGrowth || 0}
          trendLabel="rispetto al mese scorso"
        />
        <StatsCard
          title="Tasso Completamento"
          value={`${analytics?.completionRate || 0}%`}
          icon="check-circle"
          trend={analytics?.completionGrowth || 0}
          trendLabel="rispetto al mese scorso"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Andamento Iscrizioni e Revenue</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="week">Ultima settimana</option>
            <option value="month">Ultimo mese</option>
            <option value="year">Ultimo anno</option>
          </select>
        </div>
        {chartData && (
          <div className="h-80">
            <Chart type="line" data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}; 