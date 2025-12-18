import prisma from '../config/database.js';
import { AppError, NotFoundError, ValidationError, ConcurrencyError } from '../utils/errors.js';

/**
 * Agregar puntos a un usuario
 * @param {string} userId - ID del usuario receptor
 * @param {number} points - Cantidad de puntos a agregar
 * @param {string} description - Descripción de la transacción
 * @param {string} adminId - ID del usuario que realiza la acción
 * @returns {Promise<{wallet, transaction}>}
 */
export const addPoints = async (userId, points, description, adminId) => {
  // Validaciones
  if (points <= 0) {
    throw new ValidationError('La cantidad de puntos debe ser mayor a 0');
  }

  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  // Si el usuario no tiene wallet, crear uno
  let wallet = user.wallet;
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: userId,
        saldoActual: 0,
      },
    });
  }

  const saldoAnterior = wallet.saldoActual;
  const saldoNuevo = saldoAnterior + points;

  // Realizar transacción atómica
  const result = await prisma.$transaction(async (tx) => {
    // Actualizar wallet con control de concurrencia
    const updatedWallet = await tx.wallet.update({
      where: {
        id: wallet.id,
        version: wallet.version, // Optimistic locking
      },
      data: {
        saldoActual: saldoNuevo,
        version: { increment: 1 },
      },
    });

    // Crear registro de transacción
    const transaction = await tx.pointTransaction.create({
      data: {
        walletId: wallet.id,
        tipo: 'EARNED',
        monto: points,
        descripcion: description,
        metadata: {
          saldoAnterior,
          saldoNuevo,
          asignadoPor: adminId,
        },
      },
    });

    return { wallet: updatedWallet, transaction };
  });

  return result;
};

/**
 * Canjear beneficio por puntos
 * CONTROL DE STOCK ATÓMICO CON OPTIMISTIC CONCURRENCY
 * @param {string} userId - ID del usuario que canjea
 * @param {string} benefitId - ID del beneficio a canjear
 * @returns {Promise<{wallet, benefit, transaction}>}
 */
export const redeemBenefit = async (userId, benefitId) => {
  // 1. Obtener usuario con su wallet
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  if (!user.wallet) {
    throw new ValidationError('No tienes una billetera activa');
  }

  // 2. Obtener beneficio CON SU VERSIÓN ACTUAL
  const benefit = await prisma.benefit.findUnique({
    where: { id: benefitId },
  });

  if (!benefit) {
    throw new NotFoundError('Beneficio no encontrado');
  }

  if (!benefit.activo) {
    throw new ValidationError('Este beneficio no está disponible');
  }

  if (benefit.stock <= 0) {
    throw new ValidationError('Este beneficio está agotado');
  }

  // 3. Validar saldo suficiente
  const wallet = user.wallet;
  if (wallet.saldoActual < benefit.costoPuntos) {
    throw new ValidationError(
      `Saldo insuficiente. Necesitas ${benefit.costoPuntos} puntos, tienes ${wallet.saldoActual}`
    );
  }

  const saldoAnterior = wallet.saldoActual;
  const saldoNuevo = saldoAnterior - benefit.costoPuntos;

  // 4. TRANSACCIÓN ATÓMICA con control de concurrencia
  try {
    const result = await prisma.$transaction(async (tx) => {
      // A) Decrementar stock del beneficio con OPTIMISTIC LOCKING
      const updatedBenefit = await tx.benefit.updateMany({
        where: {
          id: benefitId,
          version: benefit.version, // ← CLAVE: Solo actualiza si la versión coincide
          stock: { gt: 0 },          // ← Extra: Verificar stock > 0
          activo: true,
        },
        data: {
          stock: { decrement: 1 },
          version: { increment: 1 }, // ← Incrementar versión
        },
      });

      // Si updateMany retorna count: 0 significa que:
      // - La versión cambió (otro usuario lo modificó)
      // - O el stock llegó a 0
      // - O fue desactivado
      if (updatedBenefit.count === 0) {
        throw new AppError(
          'El beneficio fue agotado por otro usuario. Intenta con otro.',
          409 // Conflict
        );
      }

      // B) Actualizar wallet del usuario con su propia versión
      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
          version: wallet.version,
        },
        data: {
          saldoActual: saldoNuevo,
          version: { increment: 1 },
        },
      });

      // C) Crear transacción de canje con metadata para el QR
      const transaction = await tx.pointTransaction.create({
        data: {
          walletId: wallet.id,
          tipo: 'SPENT',
          monto: benefit.costoPuntos,
          descripcion: `Canje: ${benefit.titulo}`,
          benefitId: benefit.id,
          metadata: {
            saldoAnterior,
            saldoNuevo,
            benefitTitle: benefit.titulo,
            benefitCategory: benefit.categoria,
            status: 'PENDING', // ← Estado inicial (no validado por comercio)
            generatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
          },
        },
      });

      // D) Obtener beneficio actualizado para la respuesta
      const finalBenefit = await tx.benefit.findUnique({
        where: { id: benefitId },
      });

      return {
        wallet: updatedWallet,
        benefit: finalBenefit,
        transaction,
      };
    });

    return result;
  } catch (error) {
    // Manejo específico de errores de concurrencia
    if (error.code === 'P2025') {
      // Prisma: Record to update not found (versión desactualizada)
      throw new AppError(
        'El beneficio fue modificado por otro usuario. Intenta nuevamente.',
        409
      );
    }

    // Re-lanzar otros errores
    throw error;
  }
};

/**
 * Obtener historial de canjes del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>}
 */
export const getUserRedemptions = async (userId) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    return [];
  }

  const transactions = await prisma.pointTransaction.findMany({
    where: {
      walletId: wallet.id,
      tipo: 'SPENT',
    },
    include: {
      benefit: true,
    },
    orderBy: {
      fecha: 'desc',
    },
  });

  return transactions;
};

/**
 * Validar QR de canje (usado por el merchant)
 * Esta función ahora está en merchant.routes.js pero podría moverse aquí
 */
export const validateRedemption = async (transactionId, merchantId) => {
  const transaction = await prisma.pointTransaction.findUnique({
    where: { id: transactionId },
    include: {
      wallet: {
        include: {
          user: true,
        },
      },
      benefit: true,
    },
  });

  if (!transaction) {
    throw new NotFoundError('Cupón no válido o no existe');
  }

  if (transaction.tipo !== 'SPENT') {
    throw new ValidationError('Este QR no corresponde a un canje de beneficio');
  }

  const metadata = transaction.metadata || {};
  if (metadata.status === 'CLAIMED') {
    const claimedDate = new Date(metadata.claimedAt).toLocaleDateString('es-CL');
    throw new AppError(`Este cupón ya fue usado el ${claimedDate}`, 409);
  }

  // Marcar como validado
  const updated = await prisma.pointTransaction.update({
    where: { id: transactionId },
    data: {
      metadata: {
        ...metadata,
        status: 'CLAIMED',
        claimedAt: new Date().toISOString(),
        validatedBy: merchantId,
      },
    },
  });

  return {
    transaction: updated,
    user: transaction.wallet.user,
    benefit: transaction.benefit,
  };
};
