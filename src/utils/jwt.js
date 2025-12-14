import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { UnauthorizedError } from './errors.js';

/**
 * Genera un JWT para un usuario
 * @param {Object} payload - Datos del usuario (id, email, rol)
 * @param {string} expiresIn - Tiempo de expiración (default: config)
 * @returns {string} Token JWT
 */
export const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  try {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn,
      issuer: 'puntos-ciudadanos-api',
      audience: 'puntos-ciudadanos-app',
    });
  } catch (error) {
    throw new Error('Error al generar token: ' + error.message);
  }
};

/**
 * Verifica y decodifica un JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado
 * @throws {UnauthorizedError} Si el token es inválido o expirado
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'puntos-ciudadanos-api',
      audience: 'puntos-ciudadanos-app',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Token inválido');
    }
    throw new UnauthorizedError('Error de autenticación');
  }
};

/**
 * Genera un refresh token (mayor duración)
 * @param {Object} payload - Datos del usuario
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return generateToken(payload, '7d'); // 7 días
};

/**
 * Extrae el token del header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token o null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Genera payload básico para JWT
 * @param {Object} user - Usuario de la base de datos
 * @returns {Object} Payload para el token
 */
export const createTokenPayload = (user) => {
  return {
    id: user.id,
    email: user.email,
    rol: user.rol,
    estado: user.estado,
  };
};
