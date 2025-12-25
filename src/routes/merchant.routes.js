import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { isMerchantOrAdmin } from '../middlewares/authorize.js';
import * as merchantController from '../controllers/merchant.controller.js';
import prisma from '../config/database.js';

const router = Router();

/**
 * POST /api/v1/merchant/redeem
 * El comercio escanea el QR del cliente y procesa el canje
 * Solo comercios y admins
 */
router.post(
  '/redeem',
  authenticate,
  isMerchantOrAdmin,
  merchantController.redeemQRCode
);

/**
 * POST /api/v1/merchant/validate-qr
 * DEPRECATED - Usar /redeem en su lugar
 * Mantenido por compatibilidad
 */
router.post(
  '/validate-qr',
  authenticate,
  isMerchantOrAdmin,
  async (req, res) => {
    try {
      const { qrCode } = req.body;
      const merchantId = req.user.id;

      if (!qrCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Falta el código QR' 
        });
      }

      // Usar la nueva función redeemQRCode del controlador
      const result = await merchantController.redeemQRCode({ body: { qrCode }, user: { id: merchantId } }, res);

    } catch (error) {
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
      // Contar QRs validados por este comercio
      const validatedCount = await prisma.benefitRedemption.count({
        where: {
          scannedByMerchantId: req.user.id,
          status: 'REDEEMED'
        }
      });

      // Obtener detalles de los canjes
      const redemptions = await prisma.benefitRedemption.findMany({
        where: {
          scannedByMerchantId: req.user.id,
          status: 'REDEEMED'
        },
        include: {
          benefit: {
            select: {
              pointsCost: true
            }
          }
        }
      });

      const totalPuntos = redemptions.reduce((sum, r) => sum + r.benefit.pointsCost, 0);

      res.json({
        success: true,
        message: 'Estadísticas del comercio',
        data: {
          comercio: req.user.name,
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
