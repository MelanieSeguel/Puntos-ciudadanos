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
      },
      // ← NUEVO: Información del QR para mostrar al usuario
      cupon: {
        transactionId: result.transaction.id, // ← El merchant escaneará este ID
        qrData: result.transaction.id,        // ← Para generar el QR visual
        estado: 'PENDIENTE',                   // ← Estado inicial
        instrucciones: 'Muestra este código al comercio para canjear tu beneficio',
        validoHasta: result.transaction.metadata?.expiresAt,
      }
    },
    'Beneficio canjeado exitosamente. Muestra el QR al comercio',
    200
  );
});
