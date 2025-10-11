
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './component/Navbar';
import Footer from './component/Footer';
import Homepage from './pages/homepage';
import About from './pages/about';
import Auth from './pages/Auth';
import Docs from './pages/Docs';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar isAuthenticated={isAuthenticated} onLogout={() => setIsAuthenticated(false)} />
        <main className="flex-grow pt-16">
          <div className="w-full max-w-full px-0">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/about" element={<About />} />
              <Route path="/docs" element={<Docs />} />
              <Route
                path="/auth"
                element={
                  <Auth
                    onLogin={() => setIsAuthenticated(true)}
                    onSignup={() => setIsAuthenticated(true)}
                  />
                }
              />
              
              {/* Protected routes - example */}
              {/* <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              /> */}
              
              {/* 404 route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;