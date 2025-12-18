import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import api from '../services/api';
import { secureStorage } from '../utils/secureStorage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: false,
    user: null,
    role: null,
    loading: true,
  });

  // Cargar datos de autenticación al iniciar la app
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await secureStorage.getItemAsync('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const userRole = await AsyncStorage.getItem('userRole');

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Configurar header de axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setAuthState({
          token,
          authenticated: true,
          user,
          role: userRole || user.rol,
          loading: false,
        });
      } else {
        setAuthState({
          token: null,
          authenticated: false,
          user: null,
          role: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error al cargar autenticación:', error);
      setAuthState({
        token: null,
        authenticated: false,
        user: null,
        role: null,
        loading: false,
      });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;

      // Guardar token en SecureStore (seguro) y datos de usuario en AsyncStorage
      await secureStorage.setItemAsync('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('userRole', user.rol);

      // Configurar header de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Actualizar estado
      setAuthState({
        token,
        authenticated: true,
        user,
        role: user.rol,
        loading: false,
      });

      return { success: true, user, role: user.rol };
    } catch (error) {
      console.error('Error en login:', error);
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(message);
    }
  };

  const register = async (nombre, email, password, confirmPassword) => {
    try {
      const response = await authAPI.register(nombre, email, password, confirmPassword);
      const { token, user } = response.data.data;

      // Guardar token en SecureStore (seguro) y datos de usuario en AsyncStorage
      await secureStorage.setItemAsync('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('userRole', user.rol);

      // Configurar header de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Actualizar estado
      setAuthState({
        token,
        authenticated: true,
        user,
        role: user.rol,
        loading: false,
      });

      return { success: true, user, role: user.rol };
    } catch (error) {
      console.error('Error en registro:', error);
      const message = error.response?.data?.message || 'Error al registrarse';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      // Limpiar token de SecureStore y datos de AsyncStorage
      await secureStorage.deleteItemAsync('userToken');
      await AsyncStorage.multiRemove(['userData', 'userRole']);

      // Limpiar header de axios
      delete api.defaults.headers.common['Authorization'];

      // Actualizar estado
      setAuthState({
        token: null,
        authenticated: false,
        user: null,
        role: null,
        loading: false,
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const value = {
    authState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
