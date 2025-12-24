import bcrypt from 'bcrypt';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { 
  ValidationError, 
  UnauthorizedError, 
  ConflictError,
  ForbiddenError 
} from '../utils/errors.js';
import { generateToken, createTokenPayload } from '../utils/jwt.js';
import prisma from '../config/database.js';
import config from '../config/index.js';

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('El email ya está registrado');
  }

  // Hashear contraseña
  const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);

  // Crear usuario con wallet
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      wallet: {
        create: {
          balance: 0,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      wallet: {
        select: {
          id: true,
          balance: true,
        },
      },
    },
  });

  // Generar token
  const token = generateToken(createTokenPayload(user));

  successResponse(
    res,
    {
      user,
      token,
    },
    'Usuario registrado exitosamente',
    201
  );
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      wallet: {
        select: {
          id: true,
          balance: true,
        },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // Verificar estado del usuario
  if (user.status === 'SUSPENDED') {
    throw new ForbiddenError('Tu cuenta ha sido suspendida. Contacta al administrador.');
  }

  if (user.status === 'DELETED') {
    throw new ForbiddenError('Esta cuenta ha sido eliminada');
  }

  if (user.status === 'INACTIVE') {
    throw new ForbiddenError('Tu cuenta está inactiva. Contacta al administrador.');
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // ========================================
  // SEGURIDAD DE ADMINISTRADORES
  // Verificar si el usuario es admin y debe cambiar contraseña inicial
  // ========================================
  if (
    (user.role === 'MASTER_ADMIN' || user.role === 'SUPPORT_ADMIN') &&
    user.mustChangePassword
  ) {
    // No generar token de sesión completo, pero sí un token limitado
    // para que el usuario pueda acceder solo a la ruta de cambio de contraseña
    const limitedToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      scope: 'CHANGE_PASSWORD_REQUIRED', // Scope limitado
    });

    // Remover passwordHash del objeto user
    const { passwordHash, ...userWithoutPassword } = user;

    // Retornar respuesta indicando que debe cambiar contraseña
    return successResponse(
      res,
      {
        user: userWithoutPassword,
        token: limitedToken,
        requirePasswordChange: true,
        message:
          'Debe cambiar su contraseña inicial por razones de seguridad',
      },
      'Cambio de contraseña requerido',
      200
    );
  }

  // Remover passwordHash del objeto user
  const { passwordHash, ...userWithoutPassword } = user;

  // Generar token completo para usuarios normales o admins con contraseña ya cambiada
  const token = generateToken(createTokenPayload(user));

  successResponse(res, {
    user: userWithoutPassword,
    token,
  }, 'Inicio de sesión exitoso');
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener usuario autenticado
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      wallet: {
        select: {
          id: true,
          balance: true,
          // version: Campo interno, no exponer al frontend
        },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  successResponse(res, user, 'Datos del usuario obtenidos');
});

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  // Si se intenta actualizar el email, verificar que no exista
  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('El email ya está en uso');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(email && { email }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  successResponse(res, updatedUser, 'Perfil actualizado exitosamente');
});

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  // Obtener usuario con contraseña
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  // Verificar contraseña actual
  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Contraseña actual incorrecta');
  }

  // Hashear nueva contraseña
  const newPasswordHash = await bcrypt.hash(newPassword, config.bcrypt.rounds);

  // Actualizar contraseña y marcar que ya fue cambiada (para admins)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
      mustChangePassword: false, // Marcar que la contraseña inicial ha sido cambiada
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      mustChangePassword: true,
    },
  });

  // Registrar en el log administrativo (si el usuario es admin)
  if (updatedUser.role === 'MASTER_ADMIN' || updatedUser.role === 'SUPPORT_ADMIN') {
    await prisma.adminLog.create({
      data: {
        adminId: userId,
        action: 'CHANGE_PASSWORD',
        targetId: userId,
        description: 'Cambio de contraseña inicial realizado',
        metadata: {
          timestamp: new Date(),
        },
      },
    });
  }

  successResponse(res, updatedUser, 'Contraseña actualizada exitosamente');
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión (invalida token en frontend)
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // En JWT stateless, el logout se maneja en el cliente eliminando el token
  // Aquí podríamos agregar el token a una blacklist si implementamos esa feature
  
  successResponse(res, null, 'Sesión cerrada exitosamente');
});
