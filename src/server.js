import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import prisma from './config/database.js';
import { AppError } from './utils/errors.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet: Protección de headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS: Control de acceso entre orígenes
app.use(cors(config.cors));

// Rate Limiting: Prevención de ataques por fuerza bruta
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(`/api/${config.apiVersion}`, limiter);

// ============================================
// GENERAL MIDDLEWARE
// ============================================

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Compression: Compresión de respuestas
app.use(compression());

// Logger: Registro de peticiones HTTP
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

// ============================================
// API ROUTES
// ============================================

app.get(`/api/${config.apiVersion}`, (req, res) => {
  res.json({
    message: 'Puntos Ciudadanos API',
    version: config.apiVersion,
    status: 'running',
    documentation: `/api/${config.apiVersion}/docs`,
  });
});

// Auth routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);

// Merchant routes
import merchantRoutes from './routes/merchant.routes.js';
app.use(`/api/${config.apiVersion}/merchant`, merchantRoutes);

// Points routes
import pointsRoutes from './routes/points.routes.js';
app.use(`/api/${config.apiVersion}/points`, pointsRoutes);

// Benefits routes
import benefitsRoutes from './routes/benefits.routes.js';
app.use(`/api/${config.apiVersion}/benefits`, benefitsRoutes);

// Missions routes
import missionsRoutes from './routes/missions.routes.js';
app.use(`/api/${config.apiVersion}/missions`, missionsRoutes);

// Admin routes
import adminRoutes from './routes/admin.routes.js';
app.use(`/api/${config.apiVersion}/admin`, adminRoutes);

// TODO: Implementar rutas adicionales
// import userRoutes from './routes/user.routes.js';
// import walletRoutes from './routes/wallet.routes.js';
// import benefitRoutes from './routes/benefit.routes.js';
// import newsRoutes from './routes/news.routes.js';

// app.use(`/api/${config.apiVersion}/users`, userRoutes);
// app.use(`/api/${config.apiVersion}/wallets`, walletRoutes);
// app.use(`/api/${config.apiVersion}/benefits`, benefitRoutes);
// app.use(`/api/${config.apiVersion}/news`, newsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'La ruta solicitada no existe',
    path: req.originalUrl,
  });
});

// Error global handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Si es un error operacional (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.code || 'Error',
      message: err.message,
      ...(config.env === 'development' && { stack: err.stack }),
    });
  }
  
  // Error no esperado
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(statusCode).json({
    error: config.env === 'development' ? err.name : 'Error',
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('Conexión a PostgreSQL establecida');
    
    // Iniciar servidor
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${config.port}`);
      console.log(`Ambiente: ${config.env}`);
      console.log(`API: http://localhost:${config.port}/api/${config.apiVersion}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nCerrando servidor...');
  await prisma.$disconnect();
  console.log('Conexión a base de datos cerrada');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nCerrando servidor...');
  await prisma.$disconnect();
  console.log('Conexión a base de datos cerrada');
  process.exit(0);
});

startServer();

export default app;
