import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambiar según tu entorno:
// Para desarrollo local web: http://localhost:3000/api/v1
// Para dispositivo físico: http://[TU_IP_LOCAL]:3000/api/v1
// Ejemplo: http://192.168.1.100:3000/api/v1
const API_URL = 'http://localhost:3000/api/v1';

// Helper para obtener el token (compatible con navegador y React Native)
const getToken = async () => {
  try {
    // Intentar AsyncStorage primero (React Native)
    if (AsyncStorage?.getItem) {
      return await AsyncStorage.getItem('userToken');
    }
    // Fallback a localStorage (Navegador web)
    return typeof window !== 'undefined' ? window.localStorage.getItem('userToken') : null;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

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
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] Token añadido al header');
      } else {
        console.log('[API] No hay token disponible');
      }
    } catch (error) {
      console.error('[API] Error al obtener token:', error);
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
      console.warn('[API] 401 Unauthorized - Token inválido o expirado');
      // Token inválido o expirado
      try {
        if (AsyncStorage?.multiRemove) {
          await AsyncStorage.multiRemove(['userToken', 'userData', 'userRole']);
        } else if (typeof window !== 'undefined') {
          window.localStorage.removeItem('userToken');
          window.localStorage.removeItem('userData');
          window.localStorage.removeItem('userRole');
        }
      } catch (err) {
        console.error('Error al limpiar storage:', err);
      }
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
