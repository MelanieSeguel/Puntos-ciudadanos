import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

/**
 * GET /api/v1/benefits
 * Listar beneficios disponibles
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, active = 'true' } = req.query;

    const where = {
      active: active === 'true',
      stock: { gt: 0 },
    };

    if (category) {
      where.category = category;
    }

    const benefits = await prisma.benefit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        pointsCost: true,
        stock: true,
        category: true,
        active: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: benefits,
      total: benefits.length,
    });
  } catch (error) {
    console.error('Error listando beneficios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener beneficios',
    });
  }
});

/**
 * GET /api/v1/benefits/:id
 * Obtener detalle de un beneficio
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const benefit = await prisma.benefit.findUnique({
      where: { id },
    });

    if (!benefit) {
      return res.status(404).json({
        success: false,
        message: 'Beneficio no encontrado',
      });
    }

    res.json({
      success: true,
      data: benefit,
    });
  } catch (error) {
    console.error('Error obteniendo beneficio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener beneficio',
    });
  }
});

export default router;
