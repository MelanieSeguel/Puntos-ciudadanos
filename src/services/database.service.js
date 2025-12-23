// Servicios de utilidad para operaciones de base de datos

import prisma from '../config/database.js';
import { ConcurrencyError } from '../utils/errors.js';

/**
 * Actualiza el saldo de una wallet con control de concurrencia optimista
 * @param {string} walletId - ID de la wallet
 * @param {number} amount - Cantidad a sumar o restar
 * @param {number} currentVersion - Versión actual de la wallet
 * @returns {Promise<Wallet>} Wallet actualizada
 * @throws {ConcurrencyError} Si la versión no coincide
 */
export const updateWalletBalance = async (walletId, amount, currentVersion) => {
  const wallet = await prisma.wallet.updateMany({
    where: {
      id: walletId,
      version: currentVersion,
    },
    data: {
      balance: {
        increment: amount,
      },
      version: {
        increment: 1,
      },
    },
  });

  if (wallet.count === 0) {
    throw new ConcurrencyError('La wallet fue modificada por otro proceso. Por favor, intenta de nuevo.');
  }

  return prisma.wallet.findUnique({
    where: { id: walletId },
  });
};

/**
 * Actualiza el stock de un beneficio con control de concurrencia optimista
 * @param {string} benefitId - ID del beneficio
 * @param {number} amount - Cantidad a restar del stock
 * @param {number} currentVersion - Versión actual del beneficio
 * @returns {Promise<Benefit>} Beneficio actualizado
 * @throws {ConcurrencyError} Si la versión no coincide
 */
export const updateBenefitStock = async (benefitId, amount, currentVersion) => {
  const benefit = await prisma.benefit.updateMany({
    where: {
      id: benefitId,
      version: currentVersion,
      stock: {
        gte: amount, // Verificar que hay stock suficiente
      },
    },
    data: {
      stock: {
        decrement: amount,
      },
      version: {
        increment: 1,
      },
    },
  });

  if (benefit.count === 0) {
    const currentBenefit = await prisma.benefit.findUnique({
      where: { id: benefitId },
    });
    
    if (!currentBenefit) {
      throw new Error('Beneficio no encontrado');
    }
    
    if (currentBenefit.stock < amount) {
      throw new Error('Stock insuficiente');
    }
    
    throw new ConcurrencyError('El beneficio fue modificado por otro proceso. Por favor, intenta de nuevo.');
  }

  return prisma.benefit.findUnique({
    where: { id: benefitId },
  });
};
