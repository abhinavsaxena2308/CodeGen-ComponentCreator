import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, signOut as signOutAuth, getCurrentUser } from '../services/auth.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser || null);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = onAuthStateChange((event, currentUser) => {
      setUser(currentUser || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await signOutAuth();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
