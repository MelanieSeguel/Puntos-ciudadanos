import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middlewares/auth.js';
import * as missionService from '../services/mission.service.js';
import * as cacheService from '../services/cache.service.js';

const router = Router();

/**
 * GET /api/v1/missions
 * Listar misiones disponibles para el usuario autenticado
 */
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('[GET /missions] Usuario:', req.user.id);
    
    // Generar clave de caché basada en userId (cada usuario puede tener diferentes cooldowns)
    const cacheKey = `${cacheService.CACHE_KEYS.AVAILABLE_MISSIONS}_${req.user.id}`;
    
    // Verificar si los datos están en caché
    const cachedMissions = cacheService.get(cacheKey);
    if (cachedMissions) {
      console.log('[GET /missions] Cache HIT para usuario:', req.user.id);
      return res.json({
        ...cachedMissions,
        cached: true,
      });
    }
    
    console.log('[GET /missions] Cache MISS para usuario:', req.user.id);
    
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
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Para cada misión, verificar si el usuario está en cooldown
    const missionsWithCooldown = await Promise.all(
      missions.map(async (mission) => {
        // Buscar la última completación de esta misión por este usuario
        const lastCompletion = await prisma.missionCompletion.findFirst({
          where: {
            userId: req.user.id,
            missionId: mission.id,
          },
          orderBy: {
            completedAt: 'desc',
          },
        });

        let cooldownUntil = null;
        if (lastCompletion && mission.cooldownDays > 0) {
          // Calcular cuándo termina el cooldown
          const cooldownEnd = new Date(lastCompletion.completedAt);
          cooldownEnd.setDate(cooldownEnd.getDate() + mission.cooldownDays);
          
          // Solo enviar cooldownUntil si aún está en cooldown
          if (cooldownEnd > new Date()) {
            cooldownUntil = cooldownEnd;
          }
        }

        return {
          ...mission,
          cooldownUntil,
        };
      })
    );

    console.log('[GET /missions] Misiones encontradas:', missionsWithCooldown.length);

    const response = {
      success: true,
      message: 'Misiones obtenidas exitosamente',
      missions: missionsWithCooldown,
      total: missionsWithCooldown.length,
      cached: false,
    };
    
    // Guardar en caché por 600 segundos (10 minutos)
    cacheService.set(cacheKey, response, 600);

    res.json(response);
  } catch (error) {
    console.error('[GET /missions] Error listando misiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener misiones',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/missions/:id
 * Obtener detalles de una misión específica
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Misión obtenida exitosamente',
      mission,
    });
  } catch (error) {
    console.error('Error obteniendo misión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener misión',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/missions/:missionId/submit
 * Enviar evidencia de completación de misión
 */
router.post('/:missionId/submit', authenticate, async (req, res) => {
  try {
    const { missionId } = req.params;
    const { evidenceUrl, description } = req.body;
    const userId = req.user.id;

    // Validar que la misión existe
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Misión no encontrada',
      });
    }

    // Usar el servicio de misiones para crear la sumisión
    const submission = await missionService.createSubmission({
      userId,
      missionId,
      evidenceUrl: evidenceUrl || 'https://via.placeholder.com/300',
      description: description || null, // Guardar la descripción del usuario
    });

    res.status(201).json({
      success: true,
      message: 'Evidencia enviada exitosamente',
      data: submission,
    });
  } catch (error) {
    console.error('Error enviando evidencia:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al enviar evidencia',
    });
  }
});

export default router;

