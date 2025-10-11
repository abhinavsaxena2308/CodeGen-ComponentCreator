import React, { useState } from 'react';
import { FaCode, FaTerminal, FaCog, FaRocket, FaChevronRight } from 'react-icons/fa';
import { SiJavascript, SiReact, SiTailwindcss } from 'react-icons/si';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [openSections, setOpenSections] = useState({
    'getting-started': true,
    'components': false,
    'api': false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navItems = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <FaRocket className="w-4 h-4" />,
      items: [
        { id: 'introduction', title: 'Introduction' },
        { id: 'installation', title: 'Installation' },
        { id: 'configuration', title: 'Configuration' }
      ]
    },
    {
      id: 'components',
      title: 'Components',
      icon: <FaCode className="w-4 h-4" />,
      items: [
        { id: 'button', title: 'Button' },
        { id: 'input', title: 'Input' },
        { id: 'card', title: 'Card' },
        { id: 'modal', title: 'Modal' }
      ]
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: <FaTerminal className="w-4 h-4" />,
      items: [
        { id: 'authentication', title: 'Authentication' },
        { id: 'endpoints', title: 'Endpoints' },
        { id: 'errors', title: 'Error Handling' }
      ]
    }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'introduction':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-gray-300 mb-6">
              Welcome to CodeGen's documentation! This guide will help you get started with our AI-powered component generation platform.
            </p>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-6">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Quick Start</h3>
              <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-green-400">
                  npx create-codegen-app@latest my-app
                </code>
              </div>
            </div>
          </div>
        );
      case 'installation':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Installation</h2>
            <p className="text-gray-300 mb-6">
              Get started by installing CodeGen CLI globally using npm or yarn:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Using npm</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-green-400">
                    npm install -g codegen-cli
                  </code>
                </div>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Using yarn</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-green-400">
                    yarn global add codegen-cli
                  </code>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50 max-w-2xl">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCode className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">CodeGen Documentation</h2>
              <p className="text-gray-300 mb-6">
                Select a section from the sidebar to get started. Here you'll find comprehensive guides and documentation to help you work with CodeGen.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {[
                  { icon: <SiReact className="w-6 h-6 text-blue-400" />, title: 'React' },
                  { icon: <SiJavascript className="w-6 h-6 text-yellow-400" />, title: 'JavaScript' },
                  { icon: <SiTailwindcss className="w-6 h-6 text-cyan-400" />, title: 'Tailwind CSS' }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-green-500/30 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      {item.icon}
                    </div>
                    <h3 className="font-medium">{item.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900/80 border-r border-gray-800 p-4 overflow-y-auto h-screen sticky top-0">
        <div className="flex items-center space-x-2 mb-8 p-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
            <FaCode className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            CodeGen Docs
          </h1>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((section) => (
            <div key={section.id} className="mb-2">
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${openSections[section.id] ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'}`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">{section.icon}</span>
                  <span>{section.title}</span>
                </div>
                <FaChevronRight 
                  className={`w-3 h-3 transition-transform ${openSections[section.id] ? 'transform rotate-90' : ''}`} 
                />
              </button>
              
              {openSections[section.id] && (
                <div className="mt-1 ml-6 space-y-1 py-2">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left p-2 text-sm rounded-lg transition-colors ${activeSection === item.id ? 'text-green-400 bg-gray-800/50' : 'text-gray-400 hover:text-white hover:bg-gray-800/30'}`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="text-xs text-gray-500 mb-2">VERSION</div>
          <div className="text-sm text-gray-400">v1.0.0</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Docs;
