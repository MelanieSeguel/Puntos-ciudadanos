import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import prisma from '../config/database.js';

/**
 * Middleware de autenticación JWT
 * Verifica que el usuario tenga un token válido
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('Token de autenticación no proporcionado');
    }

    // Verificar y decodificar token
    const decoded = verifyToken(token);

    // Verificar que el usuario aún exista y esté activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Tu cuenta no está activa');
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware opcional de autenticación
 * Agrega el usuario al request si hay token, pero no falla si no hay
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En autenticación opcional, no propagamos errores
    next();
  }
};
