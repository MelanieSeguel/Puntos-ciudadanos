import { Router } from 'express';
import * as pointsController from '../controllers/points.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/authorize.js';
import { validate } from '../validators/schemas.js';
import { addPointsSchema, redeemBenefitSchema } from '../validators/schemas.js';

const router = Router();

/**
 * GET /api/v1/points/transactions
 * Obtener historial de transacciones del usuario
 * Usuario autenticado
 */
router.get(
  '/transactions',
  authenticate,
  pointsController.getTransactions
);

/**
 * POST /api/v1/points/add
 * Agregar puntos a un usuario
 * Solo administradores
 */
router.post(
  '/add',
  authenticate,
  isAdmin,
  validate(addPointsSchema),
  pointsController.addPoints
);

/**
 * POST /api/v1/points/redeem
 * Canjear beneficio por puntos
 * Usuario autenticado
 */
router.post(
  '/redeem',
  authenticate,
  validate(redeemBenefitSchema),
  pointsController.redeemBenefit
);

export default router;
