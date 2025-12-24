import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Middleware para validar que el usuario tenga permiso de cambiar contraseña
 * Usado cuando un admin inicia sesión y debe cambiar su contraseña inicial
 */
export const validatePasswordChangeScope = (req, res, next) => {
  const user = req.user;

  // Si el usuario tiene scope limitado a CHANGE_PASSWORD_REQUIRED
  // Solo permitir acceso a rutas de cambio de contraseña
  if (user.scope === 'CHANGE_PASSWORD_REQUIRED') {
    // Permitir solo POST a /change-password y GET a /me
    const allowedRoutes = ['/api/v1/auth/change-password', '/api/v1/auth/me'];
    const currentPath = req.path;

    if (!allowedRoutes.some((route) => currentPath.includes(route))) {
      throw new ForbiddenError(
        'Debe cambiar su contraseña inicial antes de acceder a otras funcionalidades'
      );
    }
  }

  next();
};

/**
 * Middleware para verificar que es un administrador
 */
export const requireAdmin = (req, res, next) => {
  const user = req.user;

  if (user.role !== 'MASTER_ADMIN' && user.role !== 'SUPPORT_ADMIN') {
    throw new ForbiddenError('Se requieren permisos de administrador');
  }

  next();
};

/**
 * Middleware para verificar que es MASTER_ADMIN
 */
export const requireMasterAdmin = (req, res, next) => {
  const user = req.user;

  if (user.role !== 'MASTER_ADMIN') {
    throw new ForbiddenError('Se requieren permisos de MASTER_ADMIN');
  }

  next();
};

/**
 * Middleware para verificar que es merchant
 */
export const requireMerchant = (req, res, next) => {
  const user = req.user;

  if (user.role !== 'MERCHANT') {
    throw new ForbiddenError('Se requieren permisos de MERCHANT');
  }

  next();
};
