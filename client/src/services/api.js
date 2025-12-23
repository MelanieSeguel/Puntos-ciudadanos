import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.82:3000/api/v1';

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
      const token = await AsyncStorage.getItem('userToken');
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
      // Token inválido o expirado
      await AsyncStorage.multiRemove(['userToken', 'userData', 'userRole']);
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, confirmPassword) => 
    api.post('/auth/register', { name, email, password, confirmPassword }),
  getProfile: () => api.get('/auth/profile'),
};

// Servicios de wallet - Obtener datos del usuario autenticado
export const walletAPI = {
  // Obtener balance desde /auth/me que devuelve user.wallet.balance
  getBalance: () => api.get('/auth/me'),
  // NOTA: No hay endpoint de transacciones en el backend actual
  // Se puede agregar si se requiere historial
};

// Servicios de usuario autenticado
export const userAPI = {
  getMe: () => api.get('/auth/me'),
};

// Servicios de puntos
export const pointsAPI = {
  scanQR: (qrCode) => api.post('/points/scan', { qrCode }),
  redeemBenefit: (benefitId) => api.post('/points/redeem', { benefitId }),
};

// Servicios de beneficios
export const benefitsAPI = {
  getAll: (category = null, active = true) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (active !== null) params.append('active', active);
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
