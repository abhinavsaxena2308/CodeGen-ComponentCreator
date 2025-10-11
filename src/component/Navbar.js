import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaCat} from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Docs', path: '/docs' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-1 bg-gray-900/95 backdrop-blur-md shadow-xl' : 'py-2 bg-gray-900/80 backdrop-blur-sm'}`}>
      <div className="w-full max-w-full px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <div className="p-1.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 group-hover:rotate-12 transition-transform duration-500">
              <FaCat className="w-6 h-6 text-white"/>
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent group-hover:bg-gradient-to-r group-hover:from-green-300 group-hover:to-emerald-400 transition-all duration-300">
              CodeGen
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  location.pathname === link.path
                    ? 'text-white bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-500/30 shadow-lg shadow-green-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:shadow-md hover:shadow-green-500/5'
                }`}
              >
                <span className="relative group">
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'group-hover:w-full'}`}></span>
                </span>
              </Link>
            ))}
            <a
              href="#"
              className="ml-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 flex items-center"
            >
              <span>Get Started</span>
              <svg className="w-4 h-4 ml-1.5 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FaTimes className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-gradient-to-b from-gray-900/95 to-gray-900/80 backdrop-blur-sm">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                location.pathname === link.path
                  ? 'text-white bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-500/30 shadow-lg shadow-green-500/10'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:shadow-md hover:shadow-green-500/5'
              }`}
            >
              <span className="flex items-center">
                {link.name}
                {location.pathname === link.path && (
                  <span className="ml-2 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                )}
              </span>
            </Link>
          ))}
          <a
            href="#"
            className="block w-full mt-2 px-4 py-3 text-center text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>Get Started</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

