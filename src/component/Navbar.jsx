import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaCat, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      const { success } = await signOut();
      if (success) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/";
    }
  };

  const navLinks = [
    { name: "Home", path: user ? "/app" : "/" },
    { name: "About", path: "/about" },
    { name: "Docs", path: "/docs" },
  ];

  return (
    <header
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[80%] border border-gray-700/30 shadow-2xl rounded-3xl transition-all duration-700 ease-in-out
        ${
          scrolled
            ? "backdrop-blur-2xl bg-white/5 border-white/10 shadow-green-500/10"
            : "backdrop-blur-sm bg-white/0"
        }`}
    >
      <div className="flex items-center justify-between px-5 md:px-8 h-14 md:h-16">
        {/* Logo */}
        <Link
          to={user ? "/app" : "/"}
          className="flex items-center group space-x-2"
        >
          <div className="p-1.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 group-hover:rotate-12 transition-transform duration-500">
            <FaCat className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-emerald-400 transition-all duration-300">
            CodeGen
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                location.pathname === link.path
                  ? "text-white bg-gray-800/40 border border-green-500/30 shadow-lg shadow-green-500/10"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/20"
              }`}
            >
              {link.name}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 ${
                  location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/30 rounded-xl transition-all duration-300"
              >
                <FaUser className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all duration-300"
              >
                <FaSignOutAlt className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 flex items-center"
            >
              Get Started
              <svg
                className="w-4 h-4 ml-1.5 -mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
          >
            {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-500 overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pt-2 pb-4 space-y-2 bg-gray-900/70 backdrop-blur-md rounded-b-3xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-4 py-2 rounded-xl text-base font-medium transition-all duration-300 ${
                location.pathname === link.path
                  ? "text-white bg-gray-800/60 border border-green-500/30 shadow-lg shadow-green-500/10"
                  : "text-gray-300 hover:bg-gray-800/40 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to="/app"
                className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-xl transition-colors duration-300"
              >
                <FaUser className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-base font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-xl transition-colors duration-300"
              >
                <FaSignOutAlt className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="w-full mt-2 px-4 py-2 text-center text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
