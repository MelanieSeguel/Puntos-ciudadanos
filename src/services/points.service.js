import prisma from '../config/database.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';

/**
 * Servicio de gestión de puntos con transacciones ACID
 * Garantiza atomicidad en operaciones de agregar/descontar puntos
 */

/**
 * Agregar puntos a un usuario (solo admin)
 * Usa transacción para actualizar wallet y crear registro de transacción
 * @param {string} userId - ID del usuario
 * @param {number} points - Cantidad de puntos a agregar
 * @param {string} description - Descripción de la transacción
 * @param {string} adminId - ID del admin que realiza la operación
 * @returns {Promise<Object>} Transacción creada
 */
export const addPoints = async (userId, points, description, adminId) => {
  if (points <= 0) {
    throw new ValidationError('La cantidad de puntos debe ser mayor a 0');
  }

  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  });

  if (!user) {
    throw new NotFoundError('Usuario');
  }

  if (!user.wallet) {
    throw new NotFoundError('Wallet del usuario');
  }

  // Transacción ACID: Actualizar wallet y crear registro
  const result = await prisma.$transaction(async (tx) => {
    // 1. Actualizar saldo de la wallet con OCC
    const updatedWallet = await tx.wallet.update({
      where: { 
        id: user.wallet.id,
        version: user.wallet.version // Control de concurrencia optimista
      },
      data: {
        saldoActual: {
          increment: points
        },
        version: {
          increment: 1
        }
      }
    });

    // 2. Crear registro de transacción
    const transaction = await tx.pointTransaction.create({
      data: {
        tipo: 'EARNED',
        monto: points,
        descripcion: description,
        walletId: user.wallet.id,
        metadata: {
          saldoAnterior: user.wallet.saldoActual,
          saldoNuevo: updatedWallet.saldoActual,
          adminId: adminId
        }
      }
    });

    return { wallet: updatedWallet, transaction };
  });

  return result;
};

/**
 * Canjear beneficio (descontar puntos y actualizar stock)
 * Usa transacción para garantizar atomicidad
 * @param {string} userId - ID del usuario
 * @param {string} benefitId - ID del beneficio
 * @returns {Promise<Object>} Resultado del canje
 */
export const redeemBenefit = async (userId, benefitId) => {
  // 1. Verificar que el usuario existe y obtener wallet
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  });

  if (!user) {
    throw new NotFoundError('Usuario');
  }

  if (!user.wallet) {
    throw new NotFoundError('Wallet del usuario');
  }

  // 2. Verificar que el beneficio existe y está disponible
  const benefit = await prisma.benefit.findUnique({
    where: { id: benefitId }
  });

  if (!benefit) {
    throw new NotFoundError('Beneficio');
  }

  if (!benefit.activo) {
    throw new ValidationError('El beneficio no está disponible');
  }

  if (benefit.stock <= 0) {
    throw new ConflictError('El beneficio no tiene stock disponible');
  }

  // 3. Verificar saldo suficiente
  if (user.wallet.saldoActual < benefit.costoPuntos) {
    throw new ValidationError(
      `Saldo insuficiente. Tienes ${user.wallet.saldoActual} puntos, necesitas ${benefit.costoPuntos}`
    );
  }

  // 4. Transacción ACID: Descontar puntos, reducir stock y crear registro
  const result = await prisma.$transaction(async (tx) => {
    // 4.1. Actualizar wallet con OCC
    const updatedWallet = await tx.wallet.update({
      where: { 
        id: user.wallet.id,
        version: user.wallet.version
      },
      data: {
        saldoActual: {
          decrement: benefit.costoPuntos
        },
        version: {
          increment: 1
        }
      }
    });

    // 4.2. Actualizar stock del beneficio con OCC
    const updatedBenefit = await tx.benefit.update({
      where: { 
        id: benefit.id,
        version: benefit.version
      },
      data: {
        stock: {
          decrement: 1
        },
        version: {
          increment: 1
        }
      }
    });

    // 4.3. Crear registro de transacción
    const transaction = await tx.pointTransaction.create({
      data: {
        tipo: 'SPENT',
        monto: benefit.costoPuntos,
        descripcion: `Canje de beneficio: ${benefit.titulo}`,
        walletId: user.wallet.id,
        benefitId: benefit.id,
        metadata: {
          saldoAnterior: user.wallet.saldoActual,
          saldoNuevo: updatedWallet.saldoActual
        }
      }
    });

    return { 
      wallet: updatedWallet, 
      benefit: updatedBenefit,
      transaction 
    };
  });

  return result;
};

/**
 * Obtener balance y últimos movimientos de un usuario
 * @param {string} userId - ID del usuario
 * @param {number} limit - Límite de transacciones a retornar (default: 10)
 * @returns {Promise<Object>} Balance y transacciones
 */
export const getWalletBalance = async (userId, limit = 10) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: {
        include: {
          transactions: {
            orderBy: {
              fecha: 'desc'
            },
            take: limit,
            include: {
              benefit: {
                select: {
                  id: true,
                  titulo: true,
                  costoPuntos: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    throw new NotFoundError('Usuario');
  }

  if (!user.wallet) {
    throw new NotFoundError('Wallet del usuario');
  }

  return {
    saldoActual: user.wallet.saldoActual,
    ultimasTransacciones: user.wallet.transactions.map(tx => ({
      id: tx.id,
      tipo: tx.tipo,
      monto: tx.monto,
      descripcion: tx.descripcion,
      saldoAnterior: tx.metadata?.saldoAnterior || null,
      saldoNuevo: tx.metadata?.saldoNuevo || null,
      fecha: tx.fecha,
      beneficio: tx.benefit ? {
        id: tx.benefit.id,
        nombre: tx.benefit.titulo,
        puntosRequeridos: tx.benefit.costoPuntos
      } : null
    }))
  };
};

/**
 * Obtener historial completo de transacciones con paginación
 * @param {string} userId - ID del usuario
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @returns {Promise<Object>} Transacciones paginadas
 */
export const getTransactionHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  });

  if (!user || !user.wallet) {
    throw new NotFoundError('Usuario o Wallet');
  }

  const [transactions, total] = await Promise.all([
    prisma.pointTransaction.findMany({
      where: { walletId: user.wallet.id },
      orderBy: { fecha: 'desc' },
      skip,
      take: limit,
      include: {
        benefit: {
          select: {
            id: true,
            titulo: true,
            costoPuntos: true
          }
        }
      }
    }),
    prisma.pointTransaction.count({
      where: { walletId: user.wallet.id }
    })
  ]);

  return {
    transactions: transactions.map(tx => ({
      id: tx.id,
      tipo: tx.tipo,
      monto: tx.monto,
      descripcion: tx.descripcion,
      saldoAnterior: tx.metadata?.saldoAnterior || null,
      saldoNuevo: tx.metadata?.saldoNuevo || null,
      fecha: tx.fecha,
      beneficio: tx.benefit ? {
        id: tx.benefit.id,
        nombre: tx.benefit.titulo,
        puntosRequeridos: tx.benefit.costoPuntos
      } : null
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
