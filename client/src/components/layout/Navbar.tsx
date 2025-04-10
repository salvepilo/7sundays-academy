import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  isScrolled?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled = false }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chiudi il menu mobile quando cambia la rotta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className={`text-2xl font-bold ${isScrolled ? 'text-primary-600' : 'text-white'}`}>
              7Sundays Academy
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/courses" className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-primary-200'}`}>
                Corsi
              </Link>
              <Link href="/about" className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-primary-200'}`}>
                Chi Siamo
              </Link>
              <Link href="/contact" className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-primary-200'}`}>
                Contatti
              </Link>

              {isAuthenticated ? (
                <div className="relative ml-3">
                  <div className="flex items-center space-x-3">
                    <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-primary-600 hover:text-primary-800' : 'text-white hover:text-primary-200'}`}>
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-primary-200'}`}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login" className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-primary-200'}`}>
                    Accedi
                  </Link>
                  <Link href="/auth/register" className={`px-4 py-2 rounded-md text-sm font-medium ${isScrolled ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-white text-primary-600 hover:bg-primary-50'}`}>
                    Registrati
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${isScrolled ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-100' : 'text-white hover:text-primary-200 hover:bg-primary-700'}`}
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Apri menu principale</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-lg`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
            Corsi
          </Link>
          <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
            Chi Siamo
          </Link>
          <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
            Contatti
          </Link>

          {isAuthenticated ? (
            <>
              <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-gray-50">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                Accedi
              </Link>
              <Link href="/auth/register" className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700">
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;