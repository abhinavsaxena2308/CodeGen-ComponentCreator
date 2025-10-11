import React, { useState } from 'react';
import { FaGithub, FaGoogle, FaEnvelope, FaLock, FaUser, FaArrowRight, FaCode } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
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
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Create an account to get started'}
          </p>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700/80 text-white py-2.5 px-4 rounded-lg transition-colors border border-gray-700/50">
            <FaGithub className="w-5 h-5" />
            <span>GitHub</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700/80 text-white py-2.5 px-4 rounded-lg transition-colors border border-gray-700/50">
            <FaGoogle className="w-5 h-5" />
            <span>Google</span>
          </button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-4 text-sm text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
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
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-green-500/20 transition-all duration-200"
          >
            <span>{isLogin ? 'Sign in' : 'Create account'}</span>
            <FaArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={toggleForm}
              className="font-medium text-green-400 hover:text-green-300 transition-colors"
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
