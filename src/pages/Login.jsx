import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [localError, setLocalError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const { login, loading, error: contextError, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailInputRef = useRef(null);

  const from = location.state?.from?.pathname || '/dashboard';
  const showDemoCredentials = import.meta.env.VITE_SHOW_DEMO === 'true';

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (contextError || localError) {
      const timeout = setTimeout(() => {
        setLocalError(null);
        clearError();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [contextError, localError, clearError]);

  useEffect(() => {
    if (contextError) {
      setLocalError(
        contextError.includes('invalid credentials')
          ? 'Incorrect email or password. Please try again.'
          : contextError
      );
    }
  }, [contextError]);

  useEffect(() => {
    if (isAuthenticated) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        const safeFrom = ['/login', '/register'].includes(from) ? '/dashboard' : from;
        navigate(safeFrom, { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (formData.email.length > 50) {
      errors.email = 'Email cannot exceed 50 characters';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      clearError();
      const { rememberMe, ...loginData } = formData;
      const result = await login(loginData);
      if (!result.success) {
        setLocalError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-4 text-gray-600">Sign in to your BookHaven account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {localError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm" id="form-error">{localError}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    validationErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  ref={emailInputRef}
                  maxLength={50}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600" id="email-error">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    validationErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600" id="password-error">{validationErrors.password}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Forgot your password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-600 text-sm">Join thousands of book lovers and discover your next favorite read</p>
          <div className="flex justify-center gap-x-8 text-gray-500">
            <div className="text-center">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-xs">Books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">50k+</div>
              <div className="text-xs">Readers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.8★</div>
              <div className="text-xs">Rating</div>
            </div>
          </div>
        </div>

        {showSuccessToast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white rounded-lg p-4 shadow-lg flex items-center gap-x-2 animate-slide-in">
            <CheckCircle className="h-5 w-5" />
            <p className="text-sm">Logged in successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
