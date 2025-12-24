import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as pointsService from '../services/points.service.js';

/**
 * GET /api/v1/points/transactions
 * Obtener historial de transacciones del usuario autenticado
 */
export const getTransactions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  const transactions = await pointsService.getUserTransactions(userId, limit, offset);

  successResponse(
    res,
    transactions,
    'Transacciones obtenidas exitosamente',
    200
  );
});

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
      balance: result.wallet.balance,
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount,
        description: result.transaction.description,
        previousBalance: result.transaction.metadata?.saldoAnterior || null,
        newBalance: result.transaction.metadata?.saldoNuevo || null,
        createdAt: result.transaction.createdAt
      }
    },
    'Puntos agregados exitosamente',
    201
  );
});

/**
 * POST /api/v1/points/scan
 * Escanear código QR para ganar puntos (Usuario autenticado)
 */
export const scanQR = asyncHandler(async (req, res) => {
  const { qrCode } = req.body;
  const userId = req.user.id;

  if (!qrCode || typeof qrCode !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Código QR inválido'
    });
  }

  // Parsear el código QR (formato esperado: "ACTION:POINTS" ej: "RECICLAR:50")
  const [action, pointsStr] = qrCode.split(':');
  const points = parseInt(pointsStr);

  if (!action || isNaN(points) || points <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Formato de código QR inválido. Usa ACTION:POINTS (ej: RECICLAR:50)'
    });
  }

  const actionDescriptions = {
    RECICLAR: 'Reciclaje de residuos',
    TRANSPORTE: 'Uso de transporte público',
    VOLUNTARIADO: 'Actividad de voluntariado',
    LIMPIEZA: 'Limpieza de espacios públicos',
    PLANTACION: 'Plantación de árboles',
    EDUCACION: 'Actividad educativa ambiental',
    DONACION: 'Donación solidaria',
  };

  const description = actionDescriptions[action.toUpperCase()] || `Acción ciudadana: ${action}`;

  const result = await pointsService.addPoints(
    userId,
    points,
    description,
    userId // El usuario se auto-asigna puntos al escanear
  );

  successResponse(
    res,
    {
      balance: result.wallet.balance,
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount,
        description: result.transaction.description,
        previousBalance: result.transaction.metadata?.saldoAnterior || null,
        newBalance: result.transaction.metadata?.saldoNuevo || null,
        createdAt: result.transaction.createdAt
      }
    },
    'Puntos ganados exitosamente',
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
      message: 'Beneficio canjeado exitosamente',
      balance: result.wallet.balance,
      benefit: {
        id: result.benefit.id,
        name: result.benefit.title,
        pointsCost: result.benefit.pointsCost,
        remainingStock: result.benefit.stock
      },
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount,
        description: result.transaction.description,
        createdAt: result.transaction.createdAt
      },
      coupon: {
        transactionId: result.transaction.id,
        qrData: result.transaction.id,
        status: 'PENDING',
        instructions: 'Muestra este código al comercio para canjear tu beneficio',
        expiresAt: result.transaction.metadata?.expiresAt,
      }
    },
    'Beneficio canjeado exitosamente. Muestra el QR al comercio',
    200
  );
});
