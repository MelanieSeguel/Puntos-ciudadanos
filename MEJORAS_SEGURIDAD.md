# Mejoras de Seguridad y Arquitectura - Hotfix Semana 1

## Cambios Implementados

### 1. Control de Concurrencia Optimista (Optimistic Locking)

**Problema**: Race conditions en operaciones concurrentes podrían causar:
- Saldos negativos en wallets
- Stock negativo en beneficios
- Doble gasto de puntos

**Solución**: Campo `version` en modelos críticos

```prisma
model Wallet {
  version Int @default(0)
}

model Benefit {
  version Int @default(0)
}
```

**Uso en código**:
```javascript
import { updateWalletBalance } from './services/database.service.js';

// Leer versión actual
const wallet = await prisma.wallet.findUnique({ where: { id } });

// Actualizar con control de versión
await updateWalletBalance(wallet.id, -100, wallet.version);
// Si otro proceso modificó la wallet, lanzará ConcurrencyError
```

### 2. Límite de Body Reducido

**Problema**: 10MB de límite en JSON es vulnerable a DoS
**Solución**: Reducido a 1MB

```javascript
// Antes
app.use(express.json({ limit: '10mb' }));

// Ahora
app.use(express.json({ limit: '1mb' }));
```

Para archivos grandes (imágenes), usar:
- Multer para multipart/form-data
- Servicios externos (Cloudinary, S3)

### 3. CORS Mejorado para React Native/Expo

**Problema**: Frontend móvil corre en puertos diferentes
**Solución**: Múltiples orígenes configurables

```javascript
// .env
CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://localhost:19000

// config/index.js
cors: {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
```

### 4. Arquitectura Escalable

**Estructura Creada**:

```
src/
├── middlewares/
│   ├── auth.js              # JWT authentication
│   ├── authorize.js         # Role-based authorization
│   └── validateRequest.js   # express-validator wrapper
├── services/
│   └── database.service.js  # Business logic con OCC
├── utils/
│   ├── errors.js            # Custom error classes
│   ├── asyncHandler.js      # Async wrapper
│   └── response.js          # Standardized responses
```

### 5. Clases de Error Personalizadas

**Disponibles**:
- `AppError` - Error base
- `NotFoundError` - 404
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `ValidationError` - 400
- `ConflictError` - 409
- `ConcurrencyError` - 409 (para OCC)

**Uso**:
```javascript
import { NotFoundError } from './utils/errors.js';

if (!user) {
  throw new NotFoundError('Usuario');
}
```

### 6. Async Handler

**Evita try-catch repetitivo**:

```javascript
import { asyncHandler } from './utils/asyncHandler.js';

// Sin async handler
export const getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique(...);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Con async handler
export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique(...);
  res.json(user);
});
```

### 7. Respuestas Estandarizadas

```javascript
import { successResponse, paginatedResponse } from './utils/response.js';

// Respuesta simple
successResponse(res, user, 'Usuario creado', 201);
// Output: { success: true, message: "...", data: {...} }

// Respuesta paginada
paginatedResponse(res, users, { page: 1, limit: 10, total: 50 });
// Output: { success: true, data: [...], pagination: {...} }
```

## Migración Aplicada

```bash
docker exec -it puntos_ciudadanos_app npx prisma migrate dev --name add_version_control
```

**SQL generado**:
```sql
ALTER TABLE "wallets" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "benefits" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
```

## Checklist Completado

- [x] Campo `version` agregado a `Wallet` y `Benefit`
- [x] Límite de body reducido a 1MB
- [x] CORS configurado para múltiples orígenes
- [x] Estructura de carpetas escalable creada
- [x] Middleware de validación base
- [x] Clases de error personalizadas
- [x] Servicios con control de concurrencia
- [x] Utilities para respuestas y async handling
- [x] Error handler mejorado en server.js
- [x] Migración de base de datos aplicada

## Próximos Pasos (Semana 2)

Con estas mejoras, el proyecto está listo para:
1. Implementar autenticación JWT (middleware ya preparado)
2. Crear controladores usando las utilities
3. Agregar validaciones con express-validator
4. Implementar CRUD con control de concurrencia
5. Testing de race conditions

## Referencias

- [Prisma - Optimistic Concurrency Control](https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions-guide#optimistic-concurrency-control)
- [OWASP - API Security](https://owasp.org/www-project-api-security/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
