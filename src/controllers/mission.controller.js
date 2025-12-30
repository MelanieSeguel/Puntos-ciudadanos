import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * GET /api/v1/missions
 * Obtener todas las misiones disponibles
 */
export const getAvailableMissions = asyncHandler(async (req, res) => {
  const userId = req.user?.id; // Usuario autenticado (puede ser undefined si no está autenticado)

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
      expiresAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Si hay un usuario autenticado, calcular cooldownUntil para cada misión
  let missionsWithCooldown = missions;
  if (userId) {
    missionsWithCooldown = await Promise.all(
      missions.map(async (mission) => {
        // Buscar la última completación de esta misión por este usuario
        const lastCompletion = await prisma.missionCompletion.findFirst({
          where: {
            userId,
            missionId: mission.id,
          },
          orderBy: {
            completedAt: 'desc',
          },
        });

        let cooldownUntil = null;
        if (lastCompletion && mission.cooldownDays > 0) {
          // Calcular la fecha hasta la cual está en cooldown
          const completionDate = new Date(lastCompletion.completedAt);
          const cooldownEndDate = new Date(completionDate);
          cooldownEndDate.setDate(cooldownEndDate.getDate() + mission.cooldownDays);
          
          // Solo incluir cooldownUntil si está en el futuro
          if (cooldownEndDate > new Date()) {
            cooldownUntil = cooldownEndDate.toISOString();
          }
        }

        return {
          ...mission,
          cooldownUntil,
        };
      })
    );
  }

  successResponse(
    res,
    {
      missions: missionsWithCooldown,
      total: missionsWithCooldown.length,
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
