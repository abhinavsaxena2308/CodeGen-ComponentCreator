import React, { useState } from 'react';
import { FaGithub, FaGoogle, FaEnvelope, FaLock, FaUser, FaArrowRight, FaCode, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../services/auth.js';
import { toast } from 'react-hot-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
        if (result.error) throw result.error;
        toast.success('Successfully signed in!');
        navigate('/');
      } else {
        result = await signUp(formData.email, formData.password);
        if (result.error) throw result.error;
        toast.success('Account created! Please check your email to verify your account.');
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred. Please try again.');
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
            <FaCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            CodeGen
          </h1>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Create an account to get started.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleSocialLogin('GitHub')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <FaGithub className="w-5 h-5" />
            <span>GitHub</span>
          </button>
          <button
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <FaGoogle className="w-5 h-5" />
            <span>Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="nameField"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full bg-gray-800/50 border border-gray-700/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent block pl-10 p-2.5 placeholder-gray-500 transition-all"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full bg-gray-800/50 border border-gray-700/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent block pl-10 p-2.5 placeholder-gray-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full bg-gray-800/50 border border-gray-700/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent block pl-10 p-2.5 placeholder-gray-500 transition-all"
              required
            />
          </div>

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="confirmPasswordField"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full bg-gray-800/50 border border-gray-700/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-transparent block pl-10 p-2.5 placeholder-gray-500 transition-all"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-700 rounded bg-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-green-400 hover:text-green-300">
                  Forgot password?
                </a>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-green-500/20 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin w-4 h-4" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                <FaArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={toggleForm}
              className="font-medium text-green-400 hover:text-green-300 transition-colors"
              disabled={isLoading}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6">
          <p className="text-xs text-center text-gray-500">
            By {isLogin ? 'signing in' : 'signing up'}, you agree to our{' '}
            <a href="#" className="text-green-400 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-green-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
