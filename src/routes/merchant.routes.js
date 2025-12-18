import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { isMerchantOrAdmin } from '../middlewares/authorize.js';
import prisma from '../config/database.js';
import * as pointsService from '../services/points.service.js';

const router = Router();

/**
 * POST /api/v1/merchant/validate-qr
 * El comercio escanea el QR del cliente (que contiene el transactionId)
 * Solo comercios y admins
 * REFACTORIZADO: Usa la lógica centralizada del servicio
 */
router.post(
  '/validate-qr',
  authenticate,
  isMerchantOrAdmin,
  async (req, res) => {
    try {
      const { transactionId } = req.body;
      const merchantId = req.user.id;

      if (!transactionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Falta el ID del cupón' 
        });
      }

      // Usamos la lógica centralizada del servicio
      const result = await pointsService.validateRedemption(transactionId, merchantId);

      res.json({
        success: true,
        message: '✅ Cupón validado exitosamente',
        data: {
          beneficio: result.benefit.titulo,
          cliente: result.user.nombre,
          fecha: new Date().toISOString(),
          puntosUsados: result.transaction.monto,
          comercio: req.user.nombre
        }
      });

    } catch (error) {
      // Manejo de errores estándar usando los errores del servicio
      const status = error.statusCode || 500;
      res.status(status).json({ 
        success: false, 
        message: error.message || 'Error al validar cupón' 
      });
    }
  }
);

/**
 * GET /api/v1/merchant/stats
 * Estadísticas del comercio (QRs validados, etc)
 */
router.get(
  '/stats',
  authenticate,
  isMerchantOrAdmin,
  async (req, res) => {
    try {
      // Contar cupones validados por este comercio
      const validatedCount = await prisma.pointTransaction.count({
        where: {
          metadata: {
            path: ['validatedBy'],
            equals: req.user.id
          }
        }
      });

      // Sumar puntos totales de cupones validados
      const transactions = await prisma.pointTransaction.findMany({
        where: {
          metadata: {
            path: ['validatedBy'],
            equals: req.user.id
          }
        },
        select: {
          monto: true
        }
      });

      const totalPuntos = transactions.reduce((sum, t) => sum + t.monto, 0);

      res.json({
        success: true,
        message: 'Estadísticas del comercio',
        data: {
          comercio: req.user.nombre,
          qrsValidados: validatedCount,
          totalPuntosCanjeados: totalPuntos
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener estadísticas' 
      });
    }
  }
);

export default router;
