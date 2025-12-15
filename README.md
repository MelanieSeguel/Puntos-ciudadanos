# Puntos Ciudadanos

Plataforma de fidelización cívica y ecológica con backend Node.js y frontend React Native multiplataforma.

## 📱 Frontend (React Native + Expo)

Aplicación multiplataforma para iOS, Android y Web.

### Características
- ✅ Autenticación (Login/Registro)
- 💳 Wallet digital con saldo en tiempo real
- 🎁 Catálogo de beneficios canjeables
- 📊 Historial de transacciones
- 🎨 UI moderna y responsive
- 📷 Escaneo QR (próximamente)

### Iniciar Frontend

```bash
cd client
npm install
npm run web      # Para navegador web
npm start        # Para móvil con Expo Go
```

Ver documentación completa en [client/README.md](./client/README.md)

## 🔧 Backend (Node.js + Express)

API RESTful con PostgreSQL y autenticación JWT.

### Tecnologías

- **Node.js** (v20+)
- **Express.js** - Framework web
- **PostgreSQL 15** - Base de datos
- **Prisma** - ORM
- **Docker & Docker Compose** - Contenedores
- **Helmet** - Seguridad HTTP
- **bcrypt** - Hash de contraseñas
- **JWT** - Autenticación

## Prerrequisitos

- Node.js v20 o superior
- Docker y Docker Compose
- Git

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd puntos-ciudadanos
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores de configuración.

### 3. Levantar con Docker

```bash
# Construir y levantar los contenedores
docker-compose up --build

# O en segundo plano
docker-compose up -d
```

El servidor estará disponible en `http://localhost:3000`

### 4. (Alternativa) Instalación local

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Poblar base de datos con datos de prueba
npm run prisma:seed

# Iniciar servidor en modo desarrollo
npm run dev
```

## Estructura de la Base de Datos

### Modelos principales:

- **Users** - Usuarios (ciudadanos y administradores)
- **Wallets** - Billeteras de puntos (1:1 con Users)
- **PointTransactions** - Historial de transacciones (inmutable)
- **Benefits** - Catálogo de beneficios canjeables
- **News** - Noticias y comunicados

### Relaciones:

```
User (1:1) Wallet (1:N) PointTransactions
User (1:N) News
Benefit (1:N) PointTransactions
```

## API Endpoints

### Autenticación
```
POST   /api/v1/auth/register        - Registrar usuario
POST   /api/v1/auth/login           - Iniciar sesión
GET    /api/v1/auth/me              - Obtener usuario autenticado (requiere auth)
PUT    /api/v1/auth/profile         - Actualizar perfil (requiere auth)
PUT    /api/v1/auth/change-password - Cambiar contraseña (requiere auth)
POST   /api/v1/auth/logout          - Cerrar sesión (requiere auth)
```

Ver documentación completa en [AUTENTICACION.md](./AUTENTICACION.md)

### Health Check
```
GET /health                         - Estado del servidor
GET /api/v1                         - Info de la API
```

## Seguridad

### Protecciones Implementadas

- **Helmet**: Protección de headers HTTP (CSP, HSTS, etc.)
- **CORS**: Control de acceso entre orígenes con múltiples origins configurables
- **Rate Limiting**: Prevención de ataques por fuerza bruta (100 req/15min por IP)
- **bcrypt**: Hash de contraseñas con 12 rounds
- **JWT**: Tokens de autenticación seguros (preparado)
- **Body Size Limit**: Límite de 1MB en JSON para prevenir DoS
- **express-validator**: Validación de entrada (preparado)
- **Variables de entorno**: Secretos nunca en código

### Control de Concurrencia Optimista

Los modelos `Wallet` y `Benefit` incluyen un campo `version` que previene:
- Race conditions en canjes simultáneos
- Modificaciones concurrentes de saldo
- Problemas de stock negativo

Uso en servicios:
```javascript
import { updateWalletBalance, updateBenefitStock } from './services/database.service.js';

// Actualizar saldo con control de versión
await updateWalletBalance(walletId, -100, currentVersion);
```

## Comandos Docker

```bash
# Levantar servicios
docker-compose up

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir contenedores
docker-compose up --build

# Acceder al contenedor de la app
docker exec -it puntos_ciudadanos_app sh

# Acceder a PostgreSQL
docker exec -it puntos_ciudadanos_db psql -U puntos_user -d puntos_ciudadanos
```

## Scripts NPM

```bash
npm run dev              # Modo desarrollo con watch
npm start                # Iniciar servidor en producción
npm run prisma:generate  # Generar Prisma Client
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio (GUI)
npm run prisma:seed      # Poblar BD con datos de prueba
```

## Prisma Studio

Para explorar la base de datos visualmente:

```bash
npm run prisma:studio
```

Se abrirá en `http://localhost:5555`

## Datos de Prueba (Seed)

Después de ejecutar `npm run prisma:seed`:

**Administrador:**
- Email: `admin@energiaco2.com`
- Password: `admin123`

**Usuarios:**
- Email: `maria@example.com` / Password: `user123`
- Email: `juan@example.com` / Password: `user123`

## ✅ Estado del Proyecto

### Completado (Semanas 1-3)
- [x] Implementar módulo de autenticación (registro, login, JWT)
- [x] Sistema de gestión de puntos y transacciones (ACID)
- [x] Sistema de canje de beneficios con OCC
- [x] Frontend multiplataforma (React Native + Expo)
- [x] Wallet digital con saldo en tiempo real
- [x] Catálogo de beneficios con canje

### Próximos Pasos (Semana 4+)
## Documentación

### General
- [README.md](./README.md) - Este archivo
- [DESPLIEGUE.md](./DESPLIEGUE.md) - Instrucciones de instalación
- [REGISTRO_CAMBIOS.md](./REGISTRO_CAMBIOS.md) - Historial de cambios

### Backend
- [AUTENTICACION.md](./AUTENTICACION.md) - Documentación de autenticación
- [PUNTOS_WALLET.md](./PUNTOS_WALLET.md) - Sistema de puntos y wallet
- [MEJORAS_SEGURIDAD.md](./MEJORAS_SEGURIDAD.md) - Mejoras de seguridad
- [TESTS_AUTH.md](./TESTS_AUTH.md) - Testing de autenticación
- [TESTS_PUNTOS.md](./TESTS_PUNTOS.md) - Testing del sistema de puntos

### Frontend
- [client/README.md](./client/README.md) - Documentación completa del frontend
## Documentación

- [README.md](./README.md) - Este archivo
- [DESPLIEGUE.md](./DESPLIEGUE.md) - Instrucciones de instalación
- [MEJORAS_SEGURIDAD.md](./MEJORAS_SEGURIDAD.md) - Mejoras de seguridad implementadas
- [AUTENTICACION.md](./AUTENTICACION.md) - Documentación de autenticación
- [TESTS_AUTH.md](./TESTS_AUTH.md) - Guía de testing de autenticación
- [REGISTRO_CAMBIOS.md](./REGISTRO_CAMBIOS.md) - Historial de cambios

## Arquitectura

```
src/
├── config/              # Configuración (DB, env)
├── controllers/         # Controladores (lógica de negocio)
├── middlewares/         # Middlewares personalizados
│   ├── auth.js         # Autenticación JWT
│   ├── authorize.js    # Autorización por roles
│   └── validateRequest.js # Validación de entrada
├── models/              # Modelos (Prisma)
├── routes/              # Definición de rutas
├── services/            # Servicios/lógica de negocio
│   └── database.service.js # Operaciones con control de concurrencia
├── utils/               # Utilidades y helpers
│   ├── errors.js       # Clases de error personalizadas
│   ├── asyncHandler.js # Wrapper para async/await
│   └── response.js     # Respuestas estandarizadas
├── validators/          # Validaciones de entrada
└── server.js            # Punto de entrada
```

### Utilidades Clave

**Manejo de Errores**:
```javascript
import { NotFoundError, ValidationError } from './utils/errors.js';
throw new NotFoundError('Usuario');
```

**Async Handler**:
```javascript
import { asyncHandler } from './utils/asyncHandler.js';

export const getUser = asyncHandler(async (req, res) => {
  // No necesitas try-catch, se maneja automáticamente
  const user = await prisma.user.findUnique(...);
  res.json(user);
});
```

**Respuestas Estandarizadas**:
```javascript
import { successResponse, paginatedResponse } from './utils/response.js';

successResponse(res, user, 'Usuario obtenido', 200);
paginatedResponse(res, users, { page: 1, limit: 10, total: 100 });
```

## Licencia

ISC

## Autor

Energía CO2 - Backend Team
