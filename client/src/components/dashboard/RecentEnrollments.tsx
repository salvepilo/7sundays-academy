import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useEnrollments } from '@/hooks/useEnrollments';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/router';

export const RecentEnrollments = () => {
  const router = useRouter();
  const { enrollments, loading } = useEnrollments();
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

  const sortedEnrollments = [...(enrollments || [])].sort((a: any, b: any) => {
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
    if (sortField === 'progress') {
      return sortDirection === 'asc'
        ? a.progress - b.progress
        : b.progress - a.progress;
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
      header: 'Progresso',
      accessor: 'progress',
      sortable: true,
    },
    {
      header: 'Stato',
      accessor: 'status',
      sortable: false,
    },
    {
      header: 'Data Iscrizione',
      accessor: 'createdAt',
      sortable: true,
    },
  ];

  const data = sortedEnrollments.slice(0, 5).map((enrollment: any) => ({
    student: (
      <div className="flex items-center space-x-3">
        <Avatar
          src={enrollment.student.avatar}
          alt={enrollment.student.name}
          size="sm"
        />
        <span>{enrollment.student.name}</span>
      </div>
    ),
    course: enrollment.course.title,
    progress: (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${enrollment.progress}%` }}
        ></div>
      </div>
    ),
    status: (
      <Badge
        variant={
          enrollment.completed
            ? 'success'
            : enrollment.progress > 0
            ? 'info'
            : 'warning'
        }
      >
        {enrollment.completed
          ? 'Completato'
          : enrollment.progress > 0
          ? 'In Progresso'
          : 'Non Iniziato'}
      </Badge>
    ),
    createdAt: formatDate(enrollment.createdAt),
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <div className="h-4 bg-gray-200 rounded col-span-2"></div>
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
        <h3 className="text-lg font-medium text-gray-900">Iscrizioni Recenti</h3>
        <Button
          onClick={() => router.push('/admin/enrollments')}
        >
          Vedi Tutte
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