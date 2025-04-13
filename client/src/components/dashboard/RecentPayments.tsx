import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { usePayments } from '@/hooks/usePayments';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useRouter } from 'next/router';

export const RecentPayments = () => {
  const router = useRouter();
  const { payments, loading } = usePayments();
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPayments = [...(payments || [])].sort((a: any, b: any) => {
    if (sortField === 'amount') {
      return sortDirection === 'asc'
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    if (sortField === 'student') {
      return sortDirection === 'asc'
        ? a.student.name.localeCompare(b.student.name)
        : b.student.name.localeCompare(a.student.name);
    }
    if (sortField === 'course') {
      return sortDirection === 'asc'
        ? a.course.title.localeCompare(b.course.title)
        : b.course.title.localeCompare(a.course.title);
    }
    return sortDirection === 'asc'
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const columns = [
    {
      header: 'Studente',
      accessor: 'student',
      sortable: true,
    },
    {
      header: 'Corso',
      accessor: 'course',
      sortable: true,
    },
    {
      header: 'Importo',
      accessor: 'amount',
      sortable: true,
    },
    {
      header: 'Metodo',
      accessor: 'method',
      sortable: false,
    },
    {
      header: 'Stato',
      accessor: 'status',
      sortable: false,
    },
    {
      header: 'Data',
      accessor: 'createdAt',
      sortable: true,
    },
  ];

  const data = sortedPayments.slice(0, 5).map((payment: any) => ({
    student: payment.student.name,
    course: payment.course.title,
    amount: formatCurrency(payment.amount),
    method: (
      <Badge variant="info">
        {payment.method === 'stripe' ? 'Carta di Credito' : 'Altro'}
      </Badge>
    ),
    status: (
      <Badge
        variant={
          payment.status === 'completed'
            ? 'success'
            : payment.status === 'pending'
            ? 'warning'
            : 'error'
        }
      >
        {payment.status === 'completed'
          ? 'Completato'
          : payment.status === 'pending'
          ? 'In Attesa'
          : 'Fallito'}
      </Badge>
    ),
    createdAt: formatDate(payment.createdAt),
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Pagamenti Recenti</h3>
        <Button
          onClick={() => router.push('/admin/payments')}
        >
          Vedi Tutti
        </Button>
      </div>
      <Table
        columns={columns}
        data={data}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  );
}; 