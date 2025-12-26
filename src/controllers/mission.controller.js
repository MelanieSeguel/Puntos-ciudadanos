import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * GET /api/v1/missions
 * Obtener todas las misiones disponibles
 */
export const getAvailableMissions = asyncHandler(async (req, res) => {
  const missions = await prisma.mission.findMany({
    where: {
      active: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      points: true,
      frequency: true,
      cooldownDays: true,
      evidenceType: true,
      active: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  successResponse(
    res,
    {
      missions,
      total: missions.length,
    },
    'Misiones obtenidas exitosamente',
    200
  );
});

/**
 * GET /api/v1/missions/:id
 * Obtener detalles de una misión específica
 */
export const getMissionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mission = await prisma.mission.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      points: true,
      frequency: true,
      cooldownDays: true,
      evidenceType: true,
      requirements: true,
      active: true,
      createdAt: true,
    },
  });

  if (!mission) {
    return errorResponse(res, 'Misión no encontrada', 404);
  }

  successResponse(
    res,
    { mission },
    'Misión obtenida exitosamente',
    200
  );
});
