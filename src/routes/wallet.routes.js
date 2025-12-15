import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

/**
 * GET /api/v1/wallet/balance
 * Obtener saldo actual y últimos movimientos
 * Usuario autenticado
 */
router.get(
  '/balance',
  authenticate,
  walletController.getBalance
);

/**
 * GET /api/v1/wallet/transactions
 * Obtener historial completo de transacciones con paginación
 * Usuario autenticado
 */
router.get(
  '/transactions',
  authenticate,
  walletController.getTransactionHistory
);

export default router;
