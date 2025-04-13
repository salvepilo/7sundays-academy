import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/layout/AdminLayout';
import { getCourses, deleteCourse } from '../../../lib/api/courses';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiEye, FiUsers, FiBook, FiDollarSign } from 'react-icons/fi';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  status: 'published' | 'draft';
  price: number;
  totalEnrollments: number;
  totalLessons: number;
}

export default function CoursesList() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    status: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchCourses();
  }, [currentPage, filters, sortBy]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const { courses, total, pages } = await getCourses({
        page: currentPage,
        limit: 10,
        ...filters,
        sort: sortBy
      });
      setCourses(courses);
      setTotalPages(pages);
    } catch (error) {
      toast.error('Error fetching courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        toast.error('Error deleting course');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestione Corsi</h1>
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Crea Nuovo Corso
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Tutte le Categorie</option>
              <option value="web-development">Sviluppo Web</option>
              <option value="mobile-development">Sviluppo Mobile</option>
              <option value="data-science">Data Science</option>
              <option value="design">Design</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Tutti i Livelli</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzato</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Tutti gli Stati</option>
              <option value="draft">Bozza</option>
              <option value="published">Pubblicato</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="createdAt">Data Creazione</option>
              <option value="title">Titolo</option>
              <option value="totalEnrollments">Iscrizioni</option>
              <option value="price">Prezzo</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {courses.map((course) => (
                <li key={course._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded-lg object-cover shadow"
                          src={course.thumbnail || '/placeholder-course.png'}
                          alt={course.title}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                          {course.title}
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{course.category}</span>
                          <span>•</span>
                          <span className="capitalize">{course.level}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiUsers className="mr-1 h-4 w-4" />
                            {course.totalEnrollments} iscritti
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiBook className="mr-1 h-4 w-4" />
                            {course.totalLessons} lezioni
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiDollarSign className="mr-1 h-4 w-4" />
                            {course.price} €
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            course.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {course.status === 'published' ? 'Pubblicato' : 'Bozza'}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/courses/${course._id}`)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                            title="Visualizza"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/courses/${course._id}/edit`)}
                            className="p-1 text-primary-600 hover:text-primary-700"
                            title="Modifica"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Elimina"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </AdminLayout>
  );
}