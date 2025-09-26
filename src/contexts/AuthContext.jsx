import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Axios configuration
axios.defaults.baseURL = API_BASE_URL;

// Utility functions
const isValidToken = (token) => {
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.warn('Invalid token format:', error);
    return false;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const setStoredAuth = (user, token) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
};

const getStoredAuth = () => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: localStorage.getItem(USER_KEY),
});

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Context
const AuthContext = createContext();

// Axios interceptors setup
const setupAxiosInterceptors = (dispatch) => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (isValidToken(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearStoredAuth();
        dispatch({ type: 'LOGOUT' });
        window.dispatchEvent(new CustomEvent('auth-logout'));
      }
      return Promise.reject(error);
    }
  );
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Setup axios interceptors
  useEffect(() => {
    setupAxiosInterceptors(dispatch);
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => dispatch({ type: 'LOGOUT' });
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  // Initialize authentication on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { token: storedToken, user: storedUser } = getStoredAuth();

      if (!storedToken || !storedUser || !isValidToken(storedToken)) {
        clearStoredAuth();
        if (isMounted) dispatch({ type: 'LOGOUT' });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await axios.get('/auth/me');
        const { id, username, email, createdAt } = response.data;
        const user = { id, username, email, createdAt };

        if (isMounted) {
          setStoredAuth(user, storedToken);
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        }
      } catch (error) {
        console.warn('Token validation failed:', error);
        clearStoredAuth();
        if (isMounted) dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
    return () => { isMounted = false; };
  }, []);

  // Auth methods
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await axios.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { id, username, email, createdAt, token } = response.data;

      if (!token || !isValidToken(token)) {
        throw new Error('Invalid or missing token received from server');
      }

      const user = { id, username, email, createdAt };
      setStoredAuth(user, token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await axios.post('/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      const { id, username, email, createdAt, token } = response.data;

      if (!token || !isValidToken(token)) {
        throw new Error('Invalid or missing token received from server');
      }

      const user = { id, username, email, createdAt };
      setStoredAuth(user, token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && isValidToken(token)) {
        await axios.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      clearStoredAuth();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const validateToken = useCallback(async () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !isValidToken(token)) {
      throw new Error('No valid token found');
    }

    const response = await axios.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { id, username, email, createdAt } = response.data;
    const user = { id, username, email, createdAt };

    setStoredAuth(user, token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    return true;
  } catch (error) {
    console.warn('Token validation failed:', error);
    clearStoredAuth();
    dispatch({ type: 'LOGOUT' });
    return false;
  }
}, []);


  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    clearError,
    validateToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
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