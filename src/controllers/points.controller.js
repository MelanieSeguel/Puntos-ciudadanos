import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as pointsService from '../services/points.service.js';

/**
 * POST /api/v1/points/add
 * Agregar puntos a un usuario (Solo Admin)
 */
export const addPoints = asyncHandler(async (req, res) => {
  const { userId, points, description } = req.body;
  const adminId = req.user.id;

  const result = await pointsService.addPoints(
    userId,
    points,
    description,
    adminId
  );

  successResponse(
    res,
    {
      saldoActual: result.wallet.saldoActual,
      transaccion: {
        id: result.transaction.id,
        tipo: result.transaction.tipo,
        monto: result.transaction.monto,
        descripcion: result.transaction.descripcion,
        saldoAnterior: result.transaction.metadata?.saldoAnterior || null,
        saldoNuevo: result.transaction.metadata?.saldoNuevo || null,
        fecha: result.transaction.fecha
      }
    },
    'Puntos agregados exitosamente',
    201
  );
});

/**
 * POST /api/v1/points/redeem
 * Canjear beneficio (Usuario autenticado)
 */
export const redeemBenefit = asyncHandler(async (req, res) => {
  const { benefitId } = req.body;
  const userId = req.user.id;

  const result = await pointsService.redeemBenefit(userId, benefitId);

  successResponse(
    res,
    {
      mensaje: 'Beneficio canjeado exitosamente',
      saldoActual: result.wallet.saldoActual,
      beneficio: {
        id: result.benefit.id,
        nombre: result.benefit.titulo,
        puntosCanjeados: result.benefit.costoPuntos,
        stockRestante: result.benefit.stock
      },
      transaccion: {
        id: result.transaction.id,
        tipo: result.transaction.tipo,
        monto: result.transaction.monto,
        descripcion: result.transaction.descripcion,
        fecha: result.transaction.fecha
      }
    },
    'Beneficio canjeado exitosamente',
    200
  );
});
