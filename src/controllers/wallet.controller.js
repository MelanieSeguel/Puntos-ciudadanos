import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import * as pointsService from '../services/points.service.js';

/**
 * GET /api/v1/wallet/balance
 * Obtener saldo actual y últimos 10 movimientos
 */
export const getBalance = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  const balance = await pointsService.getWalletBalance(userId, limit);

  successResponse(
    res,
    balance,
    'Balance obtenido exitosamente',
    200
  );
});

/**
 * GET /api/v1/wallet/transactions
 * Obtener historial completo de transacciones con paginación
 */
export const getTransactionHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await pointsService.getTransactionHistory(userId, page, limit);

  paginatedResponse(
    res,
    result.transactions,
    result.pagination,
    'Historial de transacciones obtenido'
  );
});
