import { ForbiddenError } from '../utils/errors.js';

/**
 * Middleware de autorización por roles
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param {...string} allowedRoles - Roles permitidos para acceder a la ruta
 * @returns {Function} Middleware de Express
 * 
 * @example
 * router.get('/admin', authenticate, authorize('ADMIN'), controller)
 * router.get('/users', authenticate, authorize('ADMIN', 'USER'), controller)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        throw new ForbiddenError('Debes estar autenticado para acceder a este recurso');
      }

      // Verificar que el usuario tenga uno de los roles permitidos
      if (!allowedRoles.includes(req.user.rol)) {
        throw new ForbiddenError('No tienes permisos para acceder a este recurso');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar que el usuario es administrador
 */
export const isAdmin = authorize('ADMIN');

/**
 * Middleware para verificar que el usuario es un comercio
 */
export const isMerchant = authorize('MERCHANT');

/**
 * Middleware para verificar que el usuario es comercio o admin
 */
export const isMerchantOrAdmin = authorize('MERCHANT', 'ADMIN');

/**
 * Middleware para verificar que el usuario es el propietario del recurso
 * @param {string} paramName - Nombre del parámetro que contiene el userId (default: 'userId')
 */
export const isOwnerOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Debes estar autenticado para acceder a este recurso');
      }

      const resourceUserId = req.params[paramName];
      const isOwner = req.user.id === resourceUserId;
      const isAdmin = req.user.rol === 'ADMIN';

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('No tienes permisos para acceder a este recurso');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
