import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { isMerchantOrAdmin } from '../middlewares/authorize.js';

const router = Router();

/**
 * POST /api/v1/merchant/validate-qr
 * Validar cupón o QR escaneado por comercio
 * Solo comercios y admins
 */
router.post(
  '/validate-qr',
  authenticate,
  isMerchantOrAdmin,
  async (req, res) => {
    // TODO: Implementar lógica de validación
    res.json({
      success: true,
      message: 'Funcionalidad en desarrollo',
      merchant: {
        id: req.user.id,
        nombre: req.user.nombre,
        rol: req.user.rol
      }
    });
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
    res.json({
      success: true,
      message: 'Estadísticas del comercio',
      data: {
        qrsValidados: 0,
        totalPuntosCanjeados: 0
      }
    });
  }
);

export default router;
