import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Componenti
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/courses/CourseCard';

// Tipi
interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: string;
  category: string;
  isPublished: boolean;
  instructor: {
    _id: string;
    name: string;
  };
  enrolledCount: number;
  averageRating: number;
  ratingsCount: number;
  lessonsCount: number;
  isEnrolled?: boolean;
  progress?: number;
  completed?: boolean;
}

export default function Courses() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>(['principiante', 'intermedio', 'avanzato']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Carica i corsi
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get('/api/courses', { headers });
        const coursesData = response.data.data.courses;
        
        setCourses(coursesData);
        
        // Estrai le categorie uniche
        const uniqueCategories = [...new Set(coursesData.map((course: Course) => course.category))];
        setCategories(uniqueCategories);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei corsi:', error);
        setIsLoading(false);
        
        // Dati di esempio in caso di errore
        const mockCourses: Course[] = [
          {
            _id: '1',
            title: 'Introduzione al Marketing Digitale',
            description: 'Impara le basi del marketing digitale e come applicarle al tuo business.',
            thumbnail: '/images/courses/digital-marketing.jpg',
            duration: '4h 30m',
            level: 'principiante',
            category: 'Marketing',
            isPublished: true,
            instructor: {
              _id: '101',
              name: 'Marco Rossi'
            },
            enrolledCount: 120,
            averageRating: 4.5,
            ratingsCount: 45,
            lessonsCount: 12,
            isEnrolled: false
          },
          {
            _id: '2',
            title: 'Social Media Strategy',
            description: 'Sviluppa una strategia efficace per i social media e aumenta la tua presenza online.',
            thumbnail: '/images/courses/social-media.jpg',
            duration: '3h 45m',
            level: 'intermedio',
            category: 'Social Media',
            isPublished: true,
            instructor: {
              _id: '102',
              name: 'Laura Bianchi'
            },
            enrolledCount: 85,
            averageRating: 4.2,
            ratingsCount: 32,
            lessonsCount: 10,
            isEnrolled: false
          },
          {
            _id: '3',
            title: 'SEO Avanzato',
            description: 'Tecniche avanzate di ottimizzazione per i motori di ricerca per migliorare il posizionamento del tuo sito.',
            thumbnail: '/images/courses/seo.jpg',
            duration: '5h 15m',
            level: 'avanzato',
            category: 'SEO',
            isPublished: true,
            instructor: {
              _id: '103',
              name: 'Giovanni Verdi'
            },
            enrolledCount: 65,
            averageRating: 4.8,
            ratingsCount: 28,
            lessonsCount: 15,
            isEnrolled: false
          },
        ];
        
        setCourses(mockCourses);
        setCategories(['Marketing', 'Social Media', 'SEO']);
      }
    };

    fetchCourses();
  }, []);

  // Filtra i corsi in base ai criteri selezionati
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Corsi | 7Sundays Academy</title>
        <meta name="description" content="Esplora i nostri corsi di alta qualità" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Esplora i Nostri Corsi</h1>
            <p className="text-lg text-gray-600">
              Scopri corsi di alta qualità creati da esperti del settore
            </p>
          </div>

          {/* Filtri e Ricerca */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Cerca corsi..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Tutte le categorie</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="all">Tutti i livelli</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Elenco dei corsi */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Nessun corso trovato</h3>
              <p className="text-gray-600">Prova a modificare i filtri di ricerca</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}