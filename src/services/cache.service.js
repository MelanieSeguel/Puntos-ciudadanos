/**
 * Cache Service - Sistema de caché en memoria para reducir carga en BD
 * Usa node-cache para almacenar datos frecuentemente consultados
 */

import NodeCache from 'node-cache';

// Configuración del caché
// stdTTL: 600 segundos (10 minutos) - tiempo por defecto que los datos permanecen en caché
// checkperiod: 120 segundos - cada cuánto se verifica si hay claves expiradas
const cache = new NodeCache({
  stdTTL: 600, // 10 minutos por defecto
  checkperiod: 120, // Verificar cada 2 minutos
  useClones: false, // No clonar objetos (mejor rendimiento)
});

/**
 * Obtener un valor del caché
 * @param {string} key - Clave del caché
 * @returns {any|undefined} - Valor almacenado o undefined si no existe/expiró
 */
export const get = (key) => {
  try {
    const value = cache.get(key);
    if (value !== undefined) {
      console.log(`[CacheService] ✅ Cache HIT: ${key}`);
      return value;
    }
    console.log(`[CacheService] ❌ Cache MISS: ${key}`);
    return undefined;
  } catch (error) {
    console.error(`[CacheService] Error al obtener ${key}:`, error);
    return undefined;
  }
};

/**
 * Guardar un valor en el caché
 * @param {string} key - Clave del caché
 * @param {any} value - Valor a almacenar
 * @param {number} ttl - Tiempo de vida en segundos (opcional, usa stdTTL por defecto)
 * @returns {boolean} - true si se guardó correctamente
 */
export const set = (key, value, ttl = null) => {
  try {
    const success = ttl ? cache.set(key, value, ttl) : cache.set(key, value);
    if (success) {
      console.log(`[CacheService] 💾 Guardado en caché: ${key} (TTL: ${ttl || 600}s)`);
    }
    return success;
  } catch (error) {
    console.error(`[CacheService] Error al guardar ${key}:`, error);
    return false;
  }
};

/**
 * Eliminar una clave específica del caché
 * @param {string} key - Clave a eliminar
 * @returns {number} - Cantidad de claves eliminadas
 */
export const del = (key) => {
  try {
    const count = cache.del(key);
    console.log(`[CacheService] 🗑️ Eliminado del caché: ${key} (${count} entradas)`);
    return count;
  } catch (error) {
    console.error(`[CacheService] Error al eliminar ${key}:`, error);
    return 0;
  }
};

/**
 * Eliminar múltiples claves del caché (útil para limpiar categorías)
 * @param {string[]} keys - Array de claves a eliminar
 * @returns {number} - Cantidad total de claves eliminadas
 */
export const delMultiple = (keys) => {
  try {
    const count = cache.del(keys);
    console.log(`[CacheService] 🗑️ Eliminadas ${count} entradas del caché`);
    return count;
  } catch (error) {
    console.error('[CacheService] Error al eliminar múltiples claves:', error);
    return 0;
  }
};

/**
 * Limpiar todo el caché
 */
export const flush = () => {
  try {
    cache.flushAll();
    console.log('[CacheService] 🧹 Caché completamente limpiado');
  } catch (error) {
    console.error('[CacheService] Error al limpiar caché:', error);
  }
};

/**
 * Obtener estadísticas del caché
 * @returns {object} - Estadísticas (hits, misses, keys, ksize, vsize)
 */
export const getStats = () => {
  return cache.getStats();
};

/**
 * Obtener todas las claves almacenadas
 * @returns {string[]} - Array de claves
 */
export const keys = () => {
  return cache.keys();
};

/**
 * Verificar si una clave existe en el caché
 * @param {string} key - Clave a verificar
 * @returns {boolean}
 */
export const has = (key) => {
  return cache.has(key);
};

// Claves predefinidas para mantener consistencia
export const CACHE_KEYS = {
  ALL_BENEFITS: 'all_benefits',
  ACTIVE_BENEFITS: 'active_benefits',
  AVAILABLE_MISSIONS: 'available_missions',
  ACTIVE_MISSIONS: 'active_missions',
  BENEFIT_BY_ID: (id) => `benefit_${id}`,
  MISSION_BY_ID: (id) => `mission_${id}`,
};

export default {
  get,
  set,
  del,
  delMultiple,
  flush,
  getStats,
  keys,
  has,
  CACHE_KEYS,
};
