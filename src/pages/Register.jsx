import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { debounce } from 'lodash';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [localError, setLocalError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { register, loading, error: contextError, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

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
        contextError.includes('email already exists')
          ? 'This email is already registered. Please use another or log in.'
          : contextError
      );
    }
  }, [contextError]);

  useEffect(() => {
    if (isAuthenticated) {
      setShowSuccessModal(true);
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/dashboard', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const calculatePasswordStrength = useMemo(
    () =>
      debounce((password) => {
        if (!password) {
          return { strength: 0, errors: ['Password is required'] };
        }
        let strength = 0;
        const errors = [];

        if (password.length >= 8) strength++;
        else errors.push('At least 8 characters');
        if (/[a-z]/.test(password)) strength++;
        else errors.push('At least one lowercase letter');
        if (/[A-Z]/.test(password)) strength++;
        else errors.push('At least one uppercase letter');
        if (/[0-9]/.test(password)) strength++;
        else errors.push('At least one number');
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        else errors.push('At least one special character');

        return { strength, errors };
      }, 300),
    []
  );

  const passwordStrengthData = useMemo(() => {
    return calculatePasswordStrength(formData.password) || { strength: 0, errors: [] };
  }, [formData.password, calculatePasswordStrength]);

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      errors.username = 'Username cannot exceed 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (formData.email.length > 50) {
      errors.email = 'Email cannot exceed 50 characters';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrengthData.strength < 4) {
      errors.password = 'Password is too weak';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.terms) {
      errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
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
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  try {
    const { confirmPassword, terms, ...userData } = formData;
    await register(userData);
  } catch (err) {
    setLocalError(
      err.response?.status === 400
        ? err.response?.data?.message || 'Invalid input. Please check your details.'
        : err.response?.status === 401
          ? 'Unauthorized request. Please try again.'
          : 'Unable to connect to the server. Please try again.'
    );
  }
};


<div>
  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
    Username
  </label>
  <div className="relative">
    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    <input
      id="username"
      name="username"
      type="text"
      autoComplete="username"
      value={formData.username}
      onChange={handleChange}
      className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        validationErrors.username
          ? 'border-red-300 focus:border-red-300 focus:ring-red-500'
          : 'border-gray-300 focus:border-blue-500'
      }`}
      placeholder="Choose a username"
      aria-describedby={validationErrors.username ? 'username-error' : undefined}
      maxLength={20}
    />
  </div>
  {validationErrors.username && (
    <p className="mt-1 text-sm text-red-600" id="username-error">
      {validationErrors.username}
    </p>
  )}
</div>

  const getPasswordStrengthColor = () => {
    switch (passwordStrengthData.strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrengthData.strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-900">Join BookHaven</h2>
          <p className="mt-4 text-gray-600">Create your account and start your reading journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {localError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm" id="message-error">
                  {localError}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    validationErrors.username
                      ? 'border-red-300 focus:border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Choose a username"
                  aria-describedby={validationErrors.username ? 'username-error' : undefined}
                  maxLength={20}
                />
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-600" id="username-error">
                  {validationErrors.username}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
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
                    validationErrors.email
                      ? 'border-red-300 focus:border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter your email"
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  maxLength={50}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600" id="email-error">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    validationErrors.password
                      ? 'border-red-300 focus:border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Create a password"
                  aria-describedby={validationErrors.password || passwordStrengthData.errors.length ? 'password-error' : undefined}
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrengthData.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                  </div>
                  {passwordStrengthData.strength < 4 && passwordStrengthData.errors.length > 0 && (
                    <ul className="mt-1 text-xs text-red-600 list-disc pl-5">
                      {passwordStrengthData.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600" id="password-error">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    validationErrors.confirmPassword
                      ? 'border-red-300 focus:border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Confirm your password"
                  aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-3 h-5 w-5 text-green-500" />
                )}
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600" id="confirmPassword-error">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-describedby={validationErrors.terms ? 'terms-error' : undefined}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-800 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {validationErrors.terms && (
              <p className="mt-1 text-sm text-red-600" id="terms-error">
                {validationErrors.terms}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
              aria-label="Create account"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  ></path>
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-600 text-sm">Join BookHaven and enjoy these benefits:</p>
          <div className="grid grid-cols-3 gap-4 text-gray-500 text-xs">
            <div className="text-center">
              <div className="text-lg mb-1">📚</div>
              <div>Personalized Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-lg mb-1">🚚</div>
              <div>Free Shipping</div>
            </div>
            <div className="text-center">
              <div className="text-lg mb-1">⭐</div>
              <div>Exclusive Offers</div>
            </div>
          </div>
        </div>

        {showSuccessModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
              <div className="flex items-center gap-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <h2 id="success-modal-title" className="text-xl font-bold text-gray-900">
                  Welcome to BookHaven!
                </h2>
              </div>
              <p className="mt-4 text-gray-600">
                Your account has been created successfully. You’re now logged in and ready to explore.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/dashboard', { replace: true });
                }}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors"
                aria-label="Continue to dashboard"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;