import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaCat, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  const handleSignOut = async () => {
  try {
    const { success } = await signOut();
    if (success) {
      // Force a hard redirect to ensure all auth state is cleared
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Sign out error:', error);
    // Still navigate to landing page even if there's an error
    window.location.href = '/';
  }
};

  const navLinks = [
    { name: 'Home', path: user ? '/app' : '/' },
    { name: 'About', path: '/about' },
    { name: 'Docs', path: '/docs' },
  ];

  return React.createElement(
    "header",
    {
      className:
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 " +
        (scrolled
          ? "py-1 bg-gray-900/95 backdrop-blur-md shadow-xl"
          : "py-2 bg-gray-900/80 backdrop-blur-sm"),
    },
    React.createElement(
      "div",
      { className: "w-full max-w-7xl mx-auto px-4" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between h-16" },
        // Logo
        React.createElement(
          Link,
          {
            to: user ? "/app" : "/",
            className: "flex-shrink-0 flex items-center group",
          },
          React.createElement(
            "div",
            {
              className:
                "p-1.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 group-hover:rotate-12 transition-transform duration-500",
            },
            React.createElement(FaCat, { className: "w-6 h-6 text-white" })
          ),
          React.createElement(
            "span",
            {
              className:
                "ml-3 text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent group-hover:bg-gradient-to-r group-hover:from-green-300 group-hover:to-emerald-400 transition-all duration-300",
            },
            "CodeGen"
          )
        ),

        // Desktop Navigation
        React.createElement(
          "nav",
          { className: "hidden md:flex items-center space-x-3" },
          navLinks.map((link) =>
            React.createElement(
              Link,
              {
                key: link.name,
                to: link.path,
                className:
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 " +
                  (location.pathname === link.path
                    ? "text-white bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-500/30 shadow-lg shadow-green-500/10"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50 hover:shadow-md hover:shadow-green-500/5"),
              },
              React.createElement(
                "span",
                { className: "relative group" },
                link.name,
                React.createElement(
                  "span",
                  {
                    className:
                      "absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 " +
                      (location.pathname === link.path ? "w-full" : "group-hover:w-full"),
                  }
                )
              )
            )
          ),
          user
            ? React.createElement(
                "div",
                { className: "flex items-center space-x-3 ml-2" },
                React.createElement(
                  Link,
                  {
                    to: "/app",
                    className:
                      "flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-300",
                  },
                  React.createElement(FaUser, { className: "w-4 h-4" }),
                  React.createElement("span", null, "Dashboard")
                ),
                React.createElement(
                  "button",
                  {
                    onClick: handleSignOut,
                    className:
                      "flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors duration-300",
                  },
                  React.createElement(FaSignOutAlt, { className: "w-4 h-4" }),
                  React.createElement("span", null, "Sign Out")
                )
              )
            : React.createElement(
                Link,
                {
                  to: "/auth",
                  className:
                    "ml-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 flex items-center",
                },
                React.createElement("span", null, "Get Started"),
                React.createElement(
                  "svg",
                  {
                    className: "w-4 h-4 ml-1.5 -mr-1",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    xmlns: "http://www.w3.org/2000/svg",
                  },
                  React.createElement("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M14 5l7 7m0 0l-7 7m7-7H3",
                  })
                )
              )
        ),

        // Mobile menu button
        React.createElement(
          "div",
          { className: "md:hidden" },
          React.createElement(
            "button",
            {
              onClick: () => setIsOpen(!isOpen),
              className:
                "inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200",
              "aria-expanded": "false",
            },
            React.createElement("span", { className: "sr-only" }, "Open main menu"),
            isOpen
              ? React.createElement(FaTimes, { className: "block h-6 w-6", "aria-hidden": "true" })
              : React.createElement(FaBars, { className: "block h-6 w-6", "aria-hidden": "true" })
          )
        )
      )
    ),

    // Mobile menu
    React.createElement(
      "div",
      {
        className:
          "md:hidden transition-all duration-500 ease-in-out overflow-hidden " +
          (isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"),
      },
      React.createElement(
        "div",
        { className: "px-4 pt-2 pb-4 space-y-2 bg-gradient-to-b from-gray-900/95 to-gray-900/80 backdrop-blur-sm" },
        navLinks.map((link) =>
          React.createElement(
            Link,
            {
              key: link.name,
              to: link.path,
              className:
                "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 " +
                (location.pathname === link.path
                  ? "text-white bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-500/30 shadow-lg shadow-green-500/10"
                  : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:shadow-md hover:shadow-green-500/5"),
            },
            React.createElement(
              "span",
              { className: "flex items-center" },
              link.name,
              location.pathname === link.path &&
                React.createElement("span", {
                  className: "ml-2 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse",
                })
            )
          )
        ),
        user
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement(
                Link,
                {
                  to: "/app",
                  className:
                    " px-4 py-3 text-base font-medium text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg transition-colors duration-300 flex items-center space-x-2",
                },
                React.createElement(FaUser, { className: "w-4 h-4" }),
                React.createElement("span", null, "Dashboard")
              ),
              React.createElement(
                "button",
                {
                  onClick: handleSignOut,
                  className:
                    "w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors duration-300 flex items-center space-x-2",
                },
                React.createElement(FaSignOutAlt, { className: "w-4 h-4" }),
                React.createElement("span", null, "Sign Out")
              )
            )
          : React.createElement(
              Link,
              {
                to: "/auth",
                className:
                  " w-full mt-2 px-4 py-3 text-center text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2",
              },
              React.createElement("span", null, "Get Started"),
              React.createElement(
                "svg",
                {
                  className: "w-4 h-4",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  xmlns: "http://www.w3.org/2000/svg",
                },
                React.createElement("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M14 5l7 7m0 0l-7 7m7-7H3",
                })
              )
            )
      )
    )
  );
};

export default Navbar;