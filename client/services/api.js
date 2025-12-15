import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuración de URL base con soporte multiplataforma
const getApiUrl = () => {
  // Prioridad 1: Variable de entorno configurada
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Prioridad 2: Variable de entorno EXPO_PUBLIC
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Fallback: localhost (solo funciona en iOS simulator y web)
  console.warn('Usando API_URL por defecto (localhost). Configura EXPO_PUBLIC_API_URL en .env');
  return 'http://localhost:3000/api/v1';
};

const API_URL = getApiUrl();
console.log('📡 API URL configurada:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Wallet API
export const walletAPI = {
  getBalance: async (limit = 10) => {
    const response = await api.get(`/wallet/balance?limit=${limit}`);
    return response.data;
  },
  
  getTransactions: async (page = 1, limit = 20) => {
    const response = await api.get(`/wallet/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Points API
export const pointsAPI = {
  addPoints: async (qrData) => {
    const response = await api.post('/points/scan', qrData);
    return response.data;
  },
  
  redeemBenefit: async (benefitId) => {
    const response = await api.post('/points/redeem', { benefitId });
    return response.data;
  },
};

// Benefits API (for listing available benefits)
export const benefitsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/benefits${params ? `?${params}` : ''}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/benefits/${id}`);
    return response.data;
  },
};

// News API (assuming you'll implement this)
export const newsAPI = {
  getAll: async () => {
    const response = await api.get('/news');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },
};

export default api;
