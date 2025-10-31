import React from 'react';
import { BsGithub, BsTwitter, BsDiscord, BsInstagram } from "react-icons/bs";
import { Link } from "react-router-dom";
import { FaCat } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-900/90 backdrop-blur-sm border-t border-green-900/30">
      <div className="w-full max-w-full px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
              <Link 
                to="/" 
                className="flex-shrink-0 flex items-center group"
                aria-label="Home"
              >
                <div className="p-1.5 rounded-full bg-gradient-to-br from-green-500/90 to-emerald-600 group-hover:from-green-400 group-hover:to-emerald-500 transition-all duration-300 group-hover:scale-105">
                  <FaCat className="w-5 h-5 text-white"/>
                </div>
                <span className="ml-2 text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-emerald-400 transition-all duration-300">
                  CodeGen
                </span>
              </Link>
              <p className="text-sm text-gray-400 mt-3 md:mt-0 group">
                © {currentYear} CodeGen. All rights reserved.
                <span className="block h-0.5 w-0 bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 group-hover:w-full mt-0.5"></span>
              </p>
            </div>
          </div>

          <div className="flex space-x-5 mt-6 md:mt-0">
            <a 
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-110"
              aria-label="GitHub"
              title="Visit our GitHub"
            >
              <BsGithub className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-110"
              aria-label="Twitter"
              title="Follow us on Twitter"
            >
              <BsTwitter className="w-5 h-5" />
            </a>
            <a 
              href="https://discord.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-400 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-110"
              aria-label="Discord"
              title="Join our Discord"
            >
              <BsDiscord className="w-5 h-5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-110"
              aria-label="Instagram"
              title="Follow us on Instagram"
            >
              <BsInstagram className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Made with ❤️ by the CodeGen Team | v1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;