import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import api from '../services/api';
import { getErrorMessage, logError } from '../utils/errorHandler';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: false,
    user: null,
    role: null,
    loading: true,
    error: null,
  });

  // Cargar datos de autenticación al iniciar la app
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
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
          role: userRole || user.role,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          token: null,
          authenticated: false,
          user: null,
          role: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      logError('loadStoredAuth', error);
      setAuthState({
        token: null,
        authenticated: false,
        user: null,
        role: null,
        loading: false,
        error: getErrorMessage(error),
      });
    }
  };

  const login = async (email, password) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      // Guardar role solo si existe
      if (user.role) {
        await AsyncStorage.setItem('userRole', user.role);
      }

      // Configurar header de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Actualizar estado
      setAuthState({
        token,
        authenticated: true,
        user,
        role: user.role,
        loading: false,
        error: null,
      });

      return { success: true, user, role: user.role };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('login', error);

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  };

  const register = async (email, password, name) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authAPI.register(email, password, name);
      const { token, user } = response.data.data;

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      // Guardar role solo si existe
      if (user.role) {
        await AsyncStorage.setItem('userRole', user.role);
      }

      // Configurar header de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Actualizar estado
      setAuthState({
        token,
        authenticated: true,
        user,
        role: user.role || 'USER',
        loading: false,
        error: null,
      });

      return { success: true, user, role: user.role };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('register', error);

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Limpiar AsyncStorage
      await AsyncStorage.multiRemove(['userToken', 'userData', 'userRole']);

      // Limpiar header de axios
      delete api.defaults.headers.common['Authorization'];

      // Actualizar estado
      setAuthState({
        token: null,
        authenticated: false,
        user: null,
        role: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      logError('logout', error);
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
