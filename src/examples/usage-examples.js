// EJEMPLO: Cómo usar las utilidades y servicios creados
// Este archivo NO debe ejecutarse, es solo referencia

import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { NotFoundError, ValidationError, ConcurrencyError } from '../utils/errors.js';
import { updateWalletBalance, updateBenefitStock } from '../services/database.service.js';
import prisma from '../config/database.js';

// ============================================
// EJEMPLO 1: Controller con Async Handler
// ============================================

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: { wallet: true },
  });
  
  if (!user) {
    throw new NotFoundError('Usuario');
  }
  
  successResponse(res, user, 'Usuario obtenido');
});

// ============================================
// EJEMPLO 2: Manejo de Errores Personalizados
// ============================================

export const createUser = asyncHandler(async (req, res) => {
  const { email, nombre, password } = req.body;
  
  // Verificar si ya existe
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    throw new ValidationError('El email ya está registrado');
  }
  
  const user = await prisma.user.create({
    data: { email, nombre, passwordHash: await bcrypt.hash(password, 12) },
  });
  
  successResponse(res, user, 'Usuario creado exitosamente', 201);
});

// ============================================
// EJEMPLO 3: Control de Concurrencia en Canje
// ============================================

export const redeemBenefit = asyncHandler(async (req, res) => {
  const { benefitId } = req.params;
  const userId = req.user.id; // Asumiendo auth middleware
  
  // Usar transacción para operaciones múltiples
  const result = await prisma.$transaction(async (tx) => {
    // 1. Obtener wallet y benefit con sus versiones
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });
    
    const benefit = await tx.benefit.findUnique({
      where: { id: benefitId },
    });
    
    if (!benefit) {
      throw new NotFoundError('Beneficio');
    }
    
    if (!benefit.activo) {
      throw new ValidationError('Beneficio no disponible');
    }
    
    if (wallet.saldoActual < benefit.costoPuntos) {
      throw new ValidationError('Puntos insuficientes');
    }
    
    if (benefit.stock < 1) {
      throw new ValidationError('Sin stock disponible');
    }
    
    // 2. Actualizar con control de concurrencia
    try {
      // Reducir saldo
      await updateWalletBalance(
        wallet.id,
        -benefit.costoPuntos,
        wallet.version
      );
      
      // Reducir stock
      await updateBenefitStock(
        benefit.id,
        1,
        benefit.version
      );
      
      // 3. Crear registro de transacción
      const transaction = await tx.pointTransaction.create({
        data: {
          walletId: wallet.id,
          tipo: 'SPENT',
          monto: benefit.costoPuntos,
          descripcion: `Canje: ${benefit.titulo}`,
          benefitId: benefit.id,
          metadata: {
            benefitTitle: benefit.titulo,
            timestamp: new Date().toISOString(),
          },
        },
      });
      
      return { transaction, benefit };
      
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        throw new ConcurrencyError(
          'Otro usuario está procesando este canje. Intenta nuevamente.'
        );
      }
      throw error;
    }
  });
  
  successResponse(res, result, 'Beneficio canjeado exitosamente');
});

// ============================================
// EJEMPLO 4: Respuesta Paginada
// ============================================

export const listBenefits = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const [benefits, total] = await Promise.all([
    prisma.benefit.findMany({
      where: { activo: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.benefit.count({ where: { activo: true } }),
  ]);
  
  paginatedResponse(res, benefits, { page, limit, total });
});

// ============================================
// EJEMPLO 5: Validación con express-validator
// ============================================

import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.js';

export const createBenefitValidation = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 3, max: 255 }).withMessage('El título debe tener entre 3 y 255 caracteres'),
  
  body('costoPuntos')
    .isInt({ min: 1 }).withMessage('El costo debe ser un número positivo'),
  
  body('stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número no negativo'),
  
  body('categoria')
    .optional()
    .isIn(['Descuentos', 'Productos', 'Servicios', 'Cultura', 'Ecología', 'Salud'])
    .withMessage('Categoría inválida'),
  
  validateRequest, // Middleware que valida y devuelve errores
];

// Uso en ruta:
// router.post('/benefits', createBenefitValidation, createBenefit);

// ============================================
// EJEMPLO 6: Error Handling Manual
// ============================================

export const manualErrorExample = asyncHandler(async (req, res) => {
  try {
    // Operación que puede fallar
    await someOperation();
  } catch (error) {
    if (error.code === 'P2002') {
      // Error de Prisma: unique constraint
      throw new ValidationError('El registro ya existe');
    }
    
    if (error.code === 'P2025') {
      // Error de Prisma: record not found
      throw new NotFoundError('Registro');
    }
    
    // Re-lanzar error desconocido
    throw error;
  }
});

// ============================================
// EJEMPLO 7: Retry Logic para Concurrencia
// ============================================

export const redeemWithRetry = asyncHandler(async (req, res) => {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Intentar canje con control de concurrencia
      const result = await performRedeem(req.user.id, req.params.benefitId);
      return successResponse(res, result, 'Beneficio canjeado exitosamente');
      
    } catch (error) {
      if (error instanceof ConcurrencyError && attempt < maxRetries) {
        // Esperar un poco antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  throw new ConcurrencyError(
    `No se pudo procesar el canje después de ${maxRetries} intentos. Intenta más tarde.`
  );
});
