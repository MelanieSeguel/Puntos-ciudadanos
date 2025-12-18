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
    const { categoria, activo = 'true' } = req.query;

    const where = {
      activo: activo === 'true',
      stock: { gt: 0 },
    };

    if (categoria) {
      where.categoria = categoria;
    }

    const benefits = await prisma.benefit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        costoPuntos: true,
        stock: true,
        categoria: true,
        activo: true,
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
