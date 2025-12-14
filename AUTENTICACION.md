# Semana 2: Autenticación y Seguridad - Documentación

## Implementación Completa

### Módulos Creados

#### 1. Utilidades JWT (`src/utils/jwt.js`)
- `generateToken()` - Genera JWT con payload y expiración
- `verifyToken()` - Verifica y decodifica JWT
- `generateRefreshToken()` - Genera token de larga duración
- `extractTokenFromHeader()` - Extrae token del header Authorization
- `createTokenPayload()` - Crea payload estandarizado

#### 2. Validaciones Zod (`src/validators/schemas.js`)
- `registerSchema` - Validación de registro (nombre, email, password fuerte)
- `loginSchema` - Validación de login
- `updateProfileSchema` - Validación de actualización de perfil
- `changePasswordSchema` - Validación de cambio de contraseña
- `validate()` - Middleware genérico para validar con Zod

**Password Policy Implementada:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (@$!%*?&)

#### 3. Controlador de Autenticación (`src/controllers/auth.controller.js`)
- `register` - Registro de usuario con wallet automática
- `login` - Login con verificación de estado de cuenta
- `getMe` - Obtener datos del usuario autenticado
- `updateProfile` - Actualizar nombre y email
- `changePassword` - Cambiar contraseña con verificación
- `logout` - Cerrar sesión (stateless)

#### 4. Middleware de Autenticación (`src/middlewares/auth.js`)
- `authenticate` - Verificación obligatoria de JWT
- `optionalAuth` - Autenticación opcional (no falla si no hay token)

#### 5. Middleware de Autorización (`src/middlewares/authorize.js`)
- `authorize(...roles)` - Verificación por roles
- `isAdmin` - Shortcut para verificar admin
- `isOwnerOrAdmin` - Verificar propietario o admin

#### 6. Rutas de Autenticación (`src/routes/auth.routes.js`)
- Rate limiting específico para auth
- Todas las rutas validadas con Zod
- Documentación inline de cada endpoint

## Endpoints Disponibles

### Públicos

#### POST /api/v1/auth/register
Registrar nuevo usuario

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "USER",
      "estado": "ACTIVE",
      "fechaRegistro": "2025-12-14T...",
      "wallet": {
        "id": "uuid",
        "saldoActual": 0
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Rate Limit:** 3 registros por hora por IP

---

#### POST /api/v1/auth/login
Iniciar sesión

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "USER",
      "estado": "ACTIVE",
      "wallet": {
        "id": "uuid",
        "saldoActual": 150
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Rate Limit:** 5 intentos por 15 minutos por IP

---

### Privados (Requieren Token)

**Header requerido:**
```
Authorization: Bearer <token>
```

#### GET /api/v1/auth/me
Obtener datos del usuario autenticado

**Response (200):**
```json
{
  "success": true,
  "message": "Datos del usuario obtenidos",
  "data": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "USER",
    "estado": "ACTIVE",
    "fechaRegistro": "2025-12-14T...",
    "wallet": {
      "id": "uuid",
      "saldoActual": 150
    }
  }
}
```

---

#### PUT /api/v1/auth/profile
Actualizar perfil

**Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juancarlos@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "uuid",
    "nombre": "Juan Carlos Pérez",
    "email": "juancarlos@example.com",
    "rol": "USER",
    "estado": "ACTIVE",
    "fechaRegistro": "2025-12-14T..."
  }
}
```

---

#### PUT /api/v1/auth/change-password
Cambiar contraseña

**Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!",
  "confirmNewPassword": "NewPassword456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": null
}
```

---

#### POST /api/v1/auth/logout
Cerrar sesión

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "data": null
}
```

---

## Manejo de Errores

### Errores de Validación (400)
```json
{
  "error": "Validation Error",
  "message": "Los datos enviados no son válidos",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    },
    {
      "field": "password",
      "message": "La contraseña debe tener al menos 8 caracteres"
    }
  ]
}
```

### Error de Autenticación (401)
```json
{
  "error": "UNAUTHORIZED",
  "message": "Credenciales inválidas"
}
```

### Error de Autorización (403)
```json
{
  "error": "FORBIDDEN",
  "message": "No tienes permisos para acceder a este recurso"
}
```

### Error de Conflicto (409)
```json
{
  "error": "CONFLICT",
  "message": "El email ya está registrado"
}
```

### Rate Limit (429)
```json
{
  "message": "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos."
}
```

---

## Seguridad Implementada

### 1. Password Hashing
- **bcrypt** con 12 rounds (configurable en .env)
- Contraseñas nunca almacenadas en texto plano
- Contraseñas no retornadas en responses

### 2. JWT Security
- Tokens firmados con secret (configurar en .env)
- Expiración configurable (default: 24h)
- Issuer y audience para prevenir ataques
- Verificación de estado de usuario en cada request

### 3. Rate Limiting
- **Login**: 5 intentos / 15 min
- **Registro**: 3 intentos / 1 hora
- Solo cuenta intentos fallidos en login
- Headers estándar de rate limit

### 4. Validaciones Estrictas
- Email válido y normalizado (lowercase, trimmed)
- Password policy robusta
- Verificación de contraseña actual en cambios
- Prevención de reutilización de contraseña

### 5. Estados de Usuario
- `ACTIVE` - Usuario normal
- `INACTIVE` - No puede iniciar sesión
- `SUSPENDED` - Cuenta suspendida
- `DELETED` - Cuenta eliminada

### 6. Protección de Rutas
```javascript
// Solo usuarios autenticados
router.get('/profile', authenticate, getProfile);

// Solo administradores
router.get('/admin', authenticate, isAdmin, getAdminPanel);

// Propietario o admin
router.put('/users/:userId', authenticate, isOwnerOrAdmin('userId'), updateUser);
```

---

## Ejemplos de Uso

### Frontend (JavaScript)

```javascript
// Registro
const response = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  })
});

const { data } = await response.json();
const token = data.token;

// Guardar token (localStorage, AsyncStorage, etc.)
localStorage.setItem('token', token);

// Login
const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'juan@example.com',
    password: 'Password123!'
  })
});

const { data: loginData } = await loginResponse.json();
localStorage.setItem('token', loginData.token);

// Request autenticado
const token = localStorage.getItem('token');
const profileResponse = await fetch('http://localhost:3000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await profileResponse.json();
```

### cURL

```bash
# Registro
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123!"
  }'

# Get Me (con token)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <tu_token>"
```

---

## Próximos Pasos (Semana 3)

Con el sistema de autenticación completo, ahora se puede:
1. Implementar CRUD de usuarios (admin)
2. Sistema de gestión de puntos y wallet
3. CRUD de beneficios (admin)
4. Sistema de noticias
5. Testing de autenticación y autorización

---

## Configuración Requerida

Asegúrate de tener en tu `.env`:

```env
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
```

**¡IMPORTANTE!** Nunca subas tu `JWT_SECRET` a control de versiones.
