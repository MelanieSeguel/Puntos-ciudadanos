import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '../utils/secureStorage';

// Configuración dinámica de la API URL usando variables de entorno
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await secureStorage.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado - limpiar de ambos almacenamientos
      await secureStorage.deleteItemAsync('userToken');
      await AsyncStorage.multiRemove(['userData', 'userRole']);
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (nombre, email, password, confirmPassword) => 
    api.post('/auth/register', { nombre, email, password, confirmPassword }),
  getProfile: () => api.get('/auth/profile'),
  getMe: () => api.get('/auth/me'),
};

// Servicios de usuario
export const userAPI = {
  getTransactions: (limit = 10) => api.get(`/users/transactions?limit=${limit}`),
  getTransactionHistory: () => api.get('/users/transactions'),
};

// Servicios de wallet
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (limit = 10) => api.get(`/wallet/balance?limit=${limit}`),
};

// Servicios de puntos
export const pointsAPI = {
  scanQR: (qrCode) => api.post('/points/scan', { qrCode }),
  redeemBenefit: (benefitId) => api.post('/points/redeem', { benefitId }),
};

// Servicios de beneficios
export const benefitsAPI = {
  getAll: (categoria = null, activo = true) => {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (activo !== null) params.append('activo', activo);
    return api.get(`/benefits?${params.toString()}`);
  },
  getById: (id) => api.get(`/benefits/${id}`),
};

// Servicios de merchant
export const merchantAPI = {
  validateQR: (transactionId) => api.post('/merchant/validate-qr', { transactionId }),
  getStats: () => api.get('/merchant/stats'),
};

export default api;
