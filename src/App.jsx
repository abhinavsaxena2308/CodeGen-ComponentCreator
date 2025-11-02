import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Navbar from './component/Navbar.jsx';
import Footer from './component/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Homepage from './pages/homepage.jsx';
import About from './pages/about.jsx';
import Auth from './pages/Auth.jsx';
import Docs from './pages/Docs.jsx';

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">Loading...</div>;
  }

  if (!user) {
    // Redirect to auth page but save the location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

// Auth Route - redirect to dashboard if already logged in
const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  if (user) {
    return <Navigate to={from} replace />;
  }

  return children;
};

// Layout component that conditionally renders navbar and footer
const Layout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      <main className="flex-grow">
        <div className="w-full">
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
          <Routes>
            <Route 
              path="/" 
              element={
                <Layout showNavbar={true} showFooter={true}>
                  <Landing />
                </Layout>
              } 
            />
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <Layout showNavbar={false} showFooter={false}>
                    <Homepage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/about" 
              element={
                <Layout showNavbar={true} showFooter={true}>
                  <About />
                </Layout>
              } 
            />
            <Route 
              path="/docs" 
              element={
                <Layout showNavbar={true} showFooter={true}>
                  <Docs />
                </Layout>
              } 
            />
            <Route 
              path="/auth" 
              element={
                <AuthRoute>
                  <Layout showNavbar={true} showFooter={true}>
                    <Auth />
                  </Layout>
                </AuthRoute>
              } 
            />
            <Route 
              path="*" 
              element={
                <Layout showNavbar={true} showFooter={true}>
                  <Navigate to="/" replace />
                </Layout>
              } 
            />
          </Routes>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;