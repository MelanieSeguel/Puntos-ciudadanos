import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';
import prisma from '../config/database.js';

const router = express.Router();

/**
 * GET /api/v1/admin/submissions
 * Obtener envíos pendientes de aprobación
 * Query params: status (PENDING, APPROVED, REJECTED)
 */
router.get(
  '/submissions',
  authenticate,
  authorize('MASTER_ADMIN', 'SUPPORT_ADMIN'),
  asyncHandler(async (req, res) => {
    const { status = 'PENDING' } = req.query;

    // Validar estado
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Estado inválido', 400);
    }

    const submissions = await prisma.missionSubmission.findMany({
      where: {
        status: status,
      },
      select: {
        id: true,
        missionId: true,
        userId: true,
        evidenceUrl: true,
        observation: true,
        status: true,
        createdAt: true,
        validatedAt: true,
        mission: {
          select: {
            id: true,
            name: true,
            points: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    successResponse(
      res,
      {
        submissions,
        total: submissions.length,
        status: status,
      },
      'Envíos obtenidos exitosamente',
      200
    );
  })
);

/**
 * POST /api/v1/admin/submissions/:submissionId/approve
 * Aprobar un envío y otorgar puntos al usuario
 */
router.post(
  '/submissions/:submissionId/approve',
  authenticate,
  authorize('MASTER_ADMIN', 'SUPPORT_ADMIN'),
  asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { notes } = req.body;

    // Obtener el envío
    const submission = await prisma.missionSubmission.findUnique({
      where: { id: submissionId },
      include: {
        mission: true,
        user: true,
      },
    });

    if (!submission) {
      return errorResponse(res, 'Envío no encontrado', 404);
    }

    if (submission.status !== 'PENDING') {
      return errorResponse(res, 'Este envío ya fue procesado', 400);
    }

    // Actualizar estado del envío
    const updatedSubmission = await prisma.missionSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        validatedAt: new Date(),
        validatedById: req.user.id,
        observation: notes || null,
      },
    });

    // Crear MissionCompletion
    await prisma.missionCompletion.create({
      data: {
        userId: submission.userId,
        missionId: submission.missionId,
        completedAt: new Date(),
      },
    });

    // Obtener el wallet del usuario
    const userWallet = await prisma.wallet.findUnique({
      where: { userId: submission.userId },
    });

    if (!userWallet) {
      return errorResponse(res, 'Wallet del usuario no encontrado', 404);
    }

    // Actualizar puntos del usuario en su wallet
    await prisma.wallet.update({
      where: { userId: submission.userId },
      data: {
        balance: {
          increment: submission.mission.points,
        },
      },
    });

    // Crear transacción en el historial
    await prisma.pointTransaction.create({
      data: {
        walletId: userWallet.id,
        type: 'EARNED',
        amount: submission.mission.points,
        description: `Misión aprobada: ${submission.mission.name}`,
      },
    });

    successResponse(
      res,
      { submission: updatedSubmission },
      'Envío aprobado y puntos otorgados',
      200
    );
  })
);

/**
 * POST /api/v1/admin/submissions/:submissionId/reject
 * Rechazar un envío
 */
router.post(
  '/submissions/:submissionId/reject',
  authenticate,
  authorize('MASTER_ADMIN', 'SUPPORT_ADMIN'),
  asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return errorResponse(res, 'Debe proporcionar una razón del rechazo', 400);
    }

    // Obtener el envío
    const submission = await prisma.missionSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return errorResponse(res, 'Envío no encontrado', 404);
    }

    if (submission.status !== 'PENDING') {
      return errorResponse(res, 'Este envío ya fue procesado', 400);
    }

    // Actualizar estado del envío
    const updatedSubmission = await prisma.missionSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'REJECTED',
        validatedAt: new Date(),
        validatedById: req.user.id,
        observation: reason,
      },
    });

    successResponse(
      res,
      { submission: updatedSubmission },
      'Envío rechazado',
      200
    );
  })
);

export default router;
