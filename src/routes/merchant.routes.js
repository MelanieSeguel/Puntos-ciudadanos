import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { isMerchantOrAdmin } from '../middlewares/authorize.js';
import prisma from '../config/database.js';

const router = Router();

/**
 * POST /api/v1/merchant/validate-qr
 * El comercio escanea el QR del cliente (que contiene el transactionId)
 * Solo comercios y admins
 */
router.post(
  '/validate-qr',
  authenticate,
  isMerchantOrAdmin,
  async (req, res) => {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requiere el ID de la transacción (QR)' 
        });
      }

      // 1. Buscar la transacción con todas las relaciones necesarias
      const transaction = await prisma.pointTransaction.findUnique({
        where: { id: transactionId },
        include: { 
          wallet: {
            include: {
              user: true  // Usuario dueño del wallet
            }
          },
          benefit: true 
        }
      });

      // 2. Validaciones de Seguridad
      if (!transaction) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cupón no válido o no existe.' 
        });
      }

      if (transaction.tipo !== 'SPENT') {
        return res.status(400).json({ 
          success: false, 
          message: 'Este QR no corresponde a un canje de beneficio.' 
        });
      }

      // Revisar si ya fue usado
      const metadata = transaction.metadata || {};
      if (metadata.status === 'CLAIMED') {
        const claimedDate = new Date(metadata.claimedAt).toLocaleDateString('es-CL');
        return res.status(409).json({ 
          success: false, 
          message: `Este cupón YA FUE USADO el ${claimedDate}` 
        });
      }

      // 3. Marcar como USADO (Quemado del cupón)
      await prisma.pointTransaction.update({
        where: { id: transactionId },
        data: {
          metadata: {
            ...metadata,
            status: 'CLAIMED',
            claimedAt: new Date().toISOString(),
            validatedBy: req.user.id,
            validatedByName: req.user.nombre
          }
        }
      });

      // 4. Responder con Éxito
      res.json({
        success: true,
        message: 'Cupón válido. Entregar beneficio al cliente',
        data: {
          beneficio: transaction.benefit?.titulo || 'Beneficio',
          cliente: transaction.wallet?.user?.nombre || 'Cliente',
          fechaCanje: transaction.fecha,
          puntosUsados: transaction.monto,
          comercio: req.user.nombre
        }
      });

    } catch (error) {
      console.error('Error validando QR:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno al validar cupón.' 
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
