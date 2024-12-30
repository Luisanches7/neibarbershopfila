import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';

export default function Navigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white shadow-sm" role="navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" aria-label="Página inicial">
            <Scissors className="w-6 h-6 text-blue-600" aria-hidden="true" />
            <span className="text-xl font-semibold text-gray-900">NeiBarber</span>
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive('/') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Fila
            </Link>
            <Link
              to="/register"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive('/register')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Entrar na Fila
            </Link>
            {!isAdmin && (
              <Link
                to="/login"
                className="text-gray-400 text-sm hover:text-gray-600 transition-colors px-2 py-2"
                aria-label="Área administrativa"
              >
                Admin
              </Link>
            )}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive('/admin')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Administração
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Fazer logout"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span>Sair</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Fila
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/register') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Entrar na Fila
              </Link>
              {!isAdmin && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-gray-500 hover:bg-gray-50"
                >
                  Admin
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/admin') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Administração
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}