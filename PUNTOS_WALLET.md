# Semana 3: Sistema de Puntos y Wallet

Documentación del sistema de gestión de puntos con transacciones ACID.

## Arquitectura de Transacciones

### Transacciones ACID Implementadas

El sistema utiliza transacciones de Prisma para garantizar:

- **Atomicidad**: Todas las operaciones se ejecutan o ninguna
- **Consistencia**: Los datos siempre quedan en estado válido
- **Aislamiento**: Las transacciones concurrentes no interfieren entre sí
- **Durabilidad**: Los cambios confirmados persisten

### Flujo de Canje de Beneficio

```
1. Verificar usuario y wallet existen
2. Verificar beneficio existe y está disponible
3. Verificar stock > 0
4. Verificar saldo suficiente
5. INICIAR TRANSACCIÓN
   a. Descontar puntos de wallet (con OCC)
   b. Reducir stock de beneficio (con OCC)
   c. Crear registro en historial
6. COMMIT o ROLLBACK automático
```

Si cualquier paso falla, se hace rollback automático de toda la transacción.

## Endpoints Disponibles

### Agregar Puntos (Admin)

```http
POST /api/v1/points/add
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "uuid-del-usuario",
  "points": 100,
  "description": "Participación en evento de reciclaje"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Puntos agregados exitosamente",
  "data": {
    "saldoActual": 250,
    "transaccion": {
      "id": "uuid",
      "tipo": "INGRESO",
      "cantidad": 100,
      "descripcion": "Participación en evento de reciclaje",
      "saldoAnterior": 150,
      "saldoNuevo": 250,
      "fecha": "2025-12-14T10:30:00Z"
    }
  }
}
```

**Errores:**
- `400` - Cantidad de puntos inválida
- `401` - No autenticado
- `403` - No es administrador
- `404` - Usuario no encontrado

---

### Canjear Beneficio

```http
POST /api/v1/points/redeem
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "benefitId": "uuid-del-beneficio"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Beneficio canjeado exitosamente",
  "data": {
    "mensaje": "Beneficio canjeado exitosamente",
    "saldoActual": 50,
    "beneficio": {
      "id": "uuid",
      "nombre": "Descuento 20% en tienda",
      "puntosCanjeados": 200,
      "stockRestante": 49
    },
    "transaccion": {
      "id": "uuid",
      "tipo": "CANJE",
      "cantidad": -200,
      "descripcion": "Canje de beneficio: Descuento 20% en tienda",
      "fecha": "2025-12-14T11:00:00Z"
    }
  }
}
```

**Errores:**
- `400` - Saldo insuficiente
- `401` - No autenticado
- `404` - Beneficio no encontrado
- `409` - Sin stock disponible o error de concurrencia

**Validaciones:**
- Usuario autenticado existe
- Beneficio existe y está disponible
- Stock > 0
- Saldo suficiente (saldoActual >= puntosRequeridos)

---

### Obtener Balance

```http
GET /api/v1/wallet/balance?limit=10
Authorization: Bearer <user_token>
```

**Parámetros Query:**
- `limit` (opcional): Número de transacciones recientes (default: 10, max: 50)

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Balance obtenido exitosamente",
  "data": {
    "saldoActual": 250,
    "ultimasTransacciones": [
      {
        "id": "uuid",
        "tipo": "CANJE",
        "cantidad": -200,
        "descripcion": "Canje de beneficio: Descuento 20% en tienda",
        "saldoAnterior": 450,
        "saldoNuevo": 250,
        "fecha": "2025-12-14T11:00:00Z",
        "beneficio": {
          "id": "uuid",
          "nombre": "Descuento 20% en tienda",
          "puntosRequeridos": 200
        }
      },
      {
        "id": "uuid",
        "tipo": "INGRESO",
        "cantidad": 100,
        "descripcion": "Participación en evento de reciclaje",
        "saldoAnterior": 350,
        "saldoNuevo": 450,
        "fecha": "2025-12-14T10:30:00Z",
        "beneficio": null
      }
    ]
  }
}
```

---

### Historial de Transacciones

```http
GET /api/v1/wallet/transactions?page=1&limit=20
Authorization: Bearer <user_token>
```

**Parámetros Query:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 20, max: 100)

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Historial de transacciones obtenido",
  "data": [
    {
      "id": "uuid",
      "tipo": "CANJE",
      "cantidad": -200,
      "descripcion": "Canje de beneficio: Descuento 20% en tienda",
      "saldoAnterior": 450,
      "saldoNuevo": 250,
      "fecha": "2025-12-14T11:00:00Z",
      "beneficio": {
        "id": "uuid",
        "nombre": "Descuento 20% en tienda",
        "puntosRequeridos": 200
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## Seguridad y Control de Concurrencia

### Control de Concurrencia Optimista (OCC)

Todos los modelos críticos (`Wallet`, `Benefit`) usan el campo `version`:

```javascript
// Si dos usuarios intentan canjear el último beneficio simultáneamente:
await prisma.benefit.update({
  where: { 
    id: benefitId,
    version: currentVersion  // Solo actualiza si la versión coincide
  },
  data: {
    stock: { decrement: 1 },
    version: { increment: 1 }
  }
});
```

Si la versión cambió, Prisma lanza un error y la transacción hace rollback automático.

### Manejo de Errores de Concurrencia

```javascript
try {
  await redeemBenefit(userId, benefitId);
} catch (error) {
  if (error.code === 'P2025') {
    // Error de OCC: otro usuario modificó el registro
    return res.status(409).json({
      error: 'CONFLICT',
      message: 'El beneficio fue modificado por otro usuario. Intenta de nuevo.'
    });
  }
  throw error;
}
```

---

## Ejemplos de Uso

### PowerShell - Agregar Puntos (Admin)

```powershell
$adminToken = "eyJhbGciOiJIUzI1NiIs..."

$body = @{
  userId = "uuid-del-usuario"
  points = 100
  description = "Participación en taller ecológico"
} | ConvertTo-Json

$response = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/v1/points/add" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $adminToken" } `
  -ContentType "application/json" `
  -Body $body

$response | ConvertTo-Json -Depth 5
```

### PowerShell - Canjear Beneficio

```powershell
$userToken = "eyJhbGciOiJIUzI1NiIs..."

$body = @{
  benefitId = "uuid-del-beneficio"
} | ConvertTo-Json

$response = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/v1/points/redeem" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $userToken" } `
  -ContentType "application/json" `
  -Body $body

$response | ConvertTo-Json -Depth 5
```

### PowerShell - Ver Balance

```powershell
$userToken = "eyJhbGciOiJIUzI1NiIs..."

$response = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/v1/wallet/balance?limit=10" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $userToken" }

Write-Host "Saldo actual: $($response.data.saldoActual) puntos"
Write-Host "Últimas transacciones:"
$response.data.ultimasTransacciones | ForEach-Object {
  Write-Host "  - $($_.tipo): $($_.cantidad) puntos - $($_.descripcion)"
}
```

### cURL - Agregar Puntos

```bash
curl -X POST http://localhost:3000/api/v1/points/add \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-del-usuario",
    "points": 100,
    "description": "Participación en taller ecológico"
  }'
```

### cURL - Canjear Beneficio

```bash
curl -X POST http://localhost:3000/api/v1/points/redeem \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "benefitId": "uuid-del-beneficio"
  }'
```

---

## Testing de Transacciones

### Caso 1: Rollback por Saldo Insuficiente

```javascript
// Usuario intenta canjear beneficio de 500 puntos con saldo de 100

// Resultado esperado:
// - Transacción falla antes de iniciar
// - Wallet no se modifica
// - Stock no se reduce
// - No se crea registro de transacción
// - Error 400: "Saldo insuficiente"
```

### Caso 2: Rollback por Stock Agotado

```javascript
// Usuario intenta canjear beneficio con stock = 0

// Resultado esperado:
// - Transacción falla antes de iniciar
// - Error 409: "El beneficio no tiene stock disponible"
```

### Caso 3: Rollback por Error de Concurrencia

```javascript
// Dos usuarios intentan canjear el último beneficio simultáneamente

// Usuario A: Inicia transacción
// Usuario B: Inicia transacción
// Usuario A: Actualiza stock (1 -> 0), incrementa version
// Usuario A: Commit exitoso
// Usuario B: Intenta actualizar stock pero version cambió
// Usuario B: Error P2025, rollback automático
// Usuario B: Recibe error 409
```

### Script de Testing Concurrente

```javascript
// Simular 10 usuarios canjeando el mismo beneficio con stock=1
const promises = Array.from({ length: 10 }, (_, i) => 
  redeemBenefit(`user-${i}`, benefitId)
);

const results = await Promise.allSettled(promises);

// Resultado esperado:
// - 1 promesa fulfilled (canje exitoso)
// - 9 promesas rejected (error de concurrencia o stock agotado)
```

---

## Estructura de Archivos

```
src/
├── controllers/
│   ├── points.controller.js    # Agregar puntos, canjear beneficios
│   └── wallet.controller.js    # Balance, historial
├── services/
│   └── points.service.js       # Lógica de negocio con transacciones
├── routes/
│   ├── points.routes.js        # Rutas de puntos
│   └── wallet.routes.js        # Rutas de wallet
└── validators/
    └── schemas.js              # Validaciones Zod (addPointsSchema, redeemBenefitSchema)
```

---

## Mejoras Futuras

### Posibles Extensiones

1. **Expiración de Puntos**: Agregar fecha de vencimiento a transacciones
2. **Tipos de Transacción Adicionales**: AJUSTE, BONIFICACION, PENALIZACION
3. **Notificaciones**: Email/SMS al canjear beneficio
4. **Límites Diarios**: Máximo de canjes por día
5. **Historial de Canjes**: Vista separada de canjes realizados
6. **Auditoría Admin**: Log de quién agregó puntos y cuándo

---

## Conclusión

El sistema de puntos implementado garantiza:

- Integridad de datos mediante transacciones ACID
- Prevención de race conditions con OCC
- Validaciones exhaustivas antes de cada operación
- Historial completo e inmutable de transacciones
- Manejo robusto de errores de concurrencia

Listo para producción.
