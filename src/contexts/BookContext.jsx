import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_BOOK_API_KEY;
const TOKEN_KEY = 'token';
const CART_KEY = 'cart';

// Configure axios
axios.defaults.baseURL = API_BASE_URL;

// Utility functions
const isValidToken = (token) => {
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return false;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};



const getStoredData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data && data !== 'undefined' ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error parsing stored data for ${key}:`, error);
    localStorage.removeItem(key);
    return null;
  }
};

const setStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing data for ${key}:`, error);
  }
};

// API helper function
const apiCall = async (method, url, data = null, dispatch) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token || !isValidToken(token)) {
      const error = 'Please log in to perform this action';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    if (data && (method === 'post' || method === 'put')) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An unexpected error occurred';

    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      dispatch({ type: 'SET_ERROR', payload: 'Your session has expired. Please log in again.' });
    } else if (error.response?.status === 403) {
      dispatch({ type: 'SET_ERROR', payload: 'Access forbidden. You do not have permission to perform this action.' });
    } else if (error.response?.status >= 500) {
      dispatch({ type: 'SET_ERROR', payload: 'Server error. Please try again later.' });
    } else if (error.code === 'ECONNABORTED') {
      dispatch({ type: 'SET_ERROR', payload: 'Request timeout. Please check your connection and try again.' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }

    return { success: false, error: errorMessage, status: error.response?.status };
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

// Google Books API integration
const fetchGoogleBooks = async (query) => {
  try {
    if (!GOOGLE_BOOKS_API_KEY) {
      throw new Error('Google Books API key not configured');
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items) return [];

    return data.items.map((item) => ({
      id: item.id,
      title: item.volumeInfo.title || 'Untitled',
      author: item.volumeInfo.authors?.[0] || 'Unknown Author',
      genre: item.volumeInfo.categories?.[0] || 'General',
      rating: item.volumeInfo.averageRating || 3.5,
      price: Math.floor(Math.random() * 1000) + 100,
      image: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150',
      description: item.volumeInfo.description || 'No description available',
      publicationDate: item.volumeInfo.publishedDate || '',
      inStock: true,
    }));
  } catch (error) {
    console.error('Google Books API error:', error);
    return [];
  }
};

// Reducer
const bookReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BOOKS':
      return { ...state, books: action.payload, loading: false };
    
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    
    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map((book) =>
          book.id === action.payload.id ? action.payload : book
        ),
      };
    
    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter((book) => book.id !== action.payload),
      };
    
    case 'SET_CART':
      return { ...state, cart: action.payload };
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.find((item) => item.id === action.payload.id);
      return existingItem
        ? {
            ...state,
            cart: state.cart.map((item) =>
              item.id === action.payload.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }
        : { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_GENRE_FILTER':
      return { ...state, genreFilter: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'LOGOUT':
      return { ...state, user: null };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  books: [],
  cart: [],
  loading: false,
  error: null,
  searchQuery: '',
  genreFilter: '',
  user: null,
};

// Context
const BookContext = createContext();

// Provider component
export const BookProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookReducer, initialState);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  // Load cart from localStorage on mount and fetch from backend if authenticated
  useEffect(() => {
    const storedCart = getStoredData(CART_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token && isValidToken(token)) {
      // If authenticated, fetch cart from backend
      const fetchCartFromBackend = async () => {
        try {
          const response = await axios.get('/cart');
          if (response.data && Array.isArray(response.data)) {
            dispatch({ type: 'SET_CART', payload: response.data });
          }
        } catch (error) {
          console.warn('Failed to fetch cart from backend, using local storage:', error);
          // Fallback to local storage if backend fetch fails
          if (storedCart && Array.isArray(storedCart)) {
            dispatch({ type: 'SET_CART', payload: storedCart });
          }
        }
      };
      fetchCartFromBackend();
    } else if (storedCart && Array.isArray(storedCart)) {
      // Not authenticated, use local storage
      dispatch({ type: 'SET_CART', payload: storedCart });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStoredData(CART_KEY, state.cart);
    }, 300); // Debounce to avoid excessive writes

    return () => clearTimeout(timeoutId);
  }, [state.cart]);

  // Fetch books based on search query
  useEffect(() => {
    let isMounted = true;
    const source = axios.CancelToken.source();

    const fetchBooks = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        let books = [];
        
        if (state.searchQuery.trim() !== '') {
          // Use Google Books API for search
          books = await fetchGoogleBooks(state.searchQuery);
        } else {
          // Fetch from local API
          const response = await axios.get('/books', { cancelToken: source.token });
          books = response.data;
        }

        if (isMounted) {
          dispatch({ type: 'SET_BOOKS', payload: books });
        }
      } catch (error) {
        if (!axios.isCancel(error) && isMounted) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch books' });
        }
      } finally {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
      source.cancel('Component unmounted');
    };
  }, [state.searchQuery]);

  // Book management methods
  const addBook = useCallback(async (bookData) => {
    try {
      // Validate required fields
      if (!bookData.title || !bookData.author || !bookData.price || bookData.price <= 0) {
        throw new Error('Invalid book data: missing required fields');
      }

      const result = await apiCall('post', '/books', {
        ...bookData,
        rating: bookData.rating || 0,
        inStock: bookData.inStock !== undefined ? bookData.inStock : true,
        image: bookData.image || 'https://via.placeholder.com/150',
      }, dispatch);

      if (result.success) {
        dispatch({ type: 'ADD_BOOK', payload: result.data });
      }

      return result;
    } catch (error) {
      const message = error.message || 'Failed to add book';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const updateBook = useCallback(async (bookData) => {
    if (!bookData.id) {
      return { success: false, error: 'Missing book ID' };
    }

    const result = await apiCall('put', `/books/${bookData.id}`, bookData, dispatch);
    
    if (result.success) {
      dispatch({ type: 'UPDATE_BOOK', payload: result.data });
    }

    return result;
  }, []);

  const deleteBook = useCallback(async (bookId) => {
    if (!bookId) {
      return { success: false, error: 'Missing book ID' };
    }

    const result = await apiCall('delete', `/books/${bookId}`, null, dispatch);
    
    if (result.success) {
      dispatch({ type: 'DELETE_BOOK', payload: bookId });
    }

    return result;
  }, []);

  // Cart management methods
  const addToCart = useCallback(async (book) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // DEBUG LINES - Add these
    console.log('🔑 Token from storage:', token ? 'EXISTS' : 'MISSING');
    console.log('✅ Token valid:', isValidToken(token));
    console.log('📚 Book ID:', book.id);
    console.log('🛒 Request data:', {
      bookId: book.id,
      quantity: 1,
      title: book.title,
      price: book.price,
    });
    
    if (!token || !isValidToken(token)) {
      const errorMsg = 'You must be logged in to add items to the cart';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }

    if (!book.inStock) {
      const errorMsg = 'This item is out of stock';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }

    const requestData = {
      bookId: book.id,
      quantity: 1,
      title: book.title,
      price: book.price,
    };

    console.log('🚀 Making API call to:', '/cart/add'); // DEBUG
    const result = await apiCall('post', '/cart/add', requestData, dispatch);
    console.log('📥 API result:', result); // DEBUG
    
    if (result.success) {
      dispatch({ type: 'ADD_TO_CART', payload: result.data });
    }

    return result;
  }, []);

  const removeFromCart = useCallback(async (bookId) => {
    const result = await apiCall('delete', `/cart/${bookId}`, null, dispatch);
    
    if (result.success) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: bookId });
    }

    return result;
  }, []);


  const updateCartQuantity = useCallback(async (bookId, quantity) => {
    if (quantity <= 0) {
      return await removeFromCart(bookId);
    }

    const result = await apiCall('put', `/cart/update/${bookId}`, { quantity }, dispatch);
    
    if (result.success) {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: bookId, quantity } });
    }

    return result;
  }, [removeFromCart]);

  const fetchCart = useCallback(async () => {
    const result = await apiCall('get', '/cart', null, dispatch);
    
    if (result.success) {
      dispatch({ type: 'SET_CART', payload: result.data });
    }

    return result;
  }, []);

  const checkout = useCallback(async () => {
    const result = await apiCall('post', '/cart/checkout', null, dispatch);
    
    if (result.success) {
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem(CART_KEY);
    }

    return result;
  }, []);

  // Utility methods
  const logout = useCallback((clearCart = false) => {
    localStorage.removeItem(TOKEN_KEY);
    if (clearCart) {
      localStorage.removeItem(CART_KEY);
      dispatch({ type: 'CLEAR_CART' });
    }
    dispatch({ type: 'LOGOUT' });
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && isValidToken(token);
  }, []);

  // Memoized computed values
  const filteredBooks = useMemo(() => {
    let filtered = state.books;
    const query = state.searchQuery.toLowerCase();

    if (query) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.genre.toLowerCase().includes(query)
      );
    }

    if (state.genreFilter) {
      filtered = filtered.filter((book) => book.genre === state.genreFilter);
    }

    return filtered;
  }, [state.books, state.searchQuery, state.genreFilter]);

  const genres = useMemo(() => {
    return [...new Set(state.books.map((book) => book.genre))].sort();
  }, [state.books]);

  const cartTotal = useMemo(() => {
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [state.cart]);

  const cartItemCount = useMemo(() => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  }, [state.cart]);

  // Context value
  const contextValue = {
    ...state,
    // Book management
    addBook,
    updateBook,
    deleteBook,
    // Cart management
    addToCart,
    removeFromCart,
    updateCartQuantity,
    fetchCart,
    checkout,
    // Computed values
    filteredBooks,
    genres,
    cartTotal: cartTotal.toFixed(2),
    cartItemCount,
    // Utility methods
    logout,
    isAuthenticated,
    // Action dispatchers
    setSearchQuery: useCallback((query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }), []),
    setGenreFilter: useCallback((genre) => dispatch({ type: 'SET_GENRE_FILTER', payload: genre }), []),
    clearError: useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []),
  };

  return (
    <BookContext.Provider value={contextValue}>
      {children}
    </BookContext.Provider>
  );
};

// Custom hook
export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};