import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Wrapper para almacenamiento seguro que funciona tanto en web como en móvil
 * - En móvil (iOS/Android): usa SecureStore (encriptado)
 * - En web: usa AsyncStorage (no hay SecureStore disponible)
 */

const isWeb = Platform.OS === 'web';

export const secureStorage = {
  async getItemAsync(key) {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error al obtener ${key}:`, error);
      return null;
    }
  },

  async setItemAsync(key, value) {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
    }
  },

  async deleteItemAsync(key) {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error);
    }
  },
};
