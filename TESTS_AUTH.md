# Tests Manuales - Autenticación

Este archivo contiene requests de prueba para validar el sistema de autenticación.

## Variables
Reemplaza estos valores según tu configuración:
- `BASE_URL`: http://localhost:3000/api/v1
- `TOKEN`: El token JWT obtenido en login/register

---

## 1. Registro de Usuario

### Request
```http
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
  "nombre": "Test User",
  "email": "test@example.com",
  "password": "Test123!@#",
  "confirmPassword": "Test123!@#"
}
```

### Tests Esperados
✓ Status: 201
✓ Response contiene `token`
✓ Response contiene `user.wallet` con `saldoActual: 0`
✓ Usuario tiene rol `USER`

### Errores a Probar
❌ Email duplicado (409):
```json
{ "email": "test@example.com", "password": "Test123!@#", "confirmPassword": "Test123!@#" }
```

❌ Password débil (400):
```json
{ "nombre": "Test", "email": "new@test.com", "password": "123", "confirmPassword": "123" }
```

❌ Passwords no coinciden (400):
```json
{ "nombre": "Test", "email": "new@test.com", "password": "Test123!@#", "confirmPassword": "Different123!@#" }
```

❌ Email inválido (400):
```json
{ "nombre": "Test", "email": "invalidemail", "password": "Test123!@#", "confirmPassword": "Test123!@#" }
```

---

## 2. Login

### Request
```http
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

### Tests Esperados
✓ Status: 200
✓ Response contiene `token`
✓ Response contiene `user` con datos completos

### Errores a Probar
❌ Credenciales incorrectas (401):
```json
{ "email": "test@example.com", "password": "WrongPassword123!" }
```

❌ Usuario no existe (401):
```json
{ "email": "noexiste@example.com", "password": "Test123!@#" }
```

❌ Rate limit (429):
Hacer 6 intentos fallidos en 15 minutos

---

## 3. Get Me (Usuario Autenticado)

### Request
```http
GET {{BASE_URL}}/auth/me
Authorization: Bearer {{TOKEN}}
```

### Tests Esperados
✓ Status: 200
✓ Response contiene datos del usuario
✓ Response contiene wallet con `version`

### Errores a Probar
❌ Sin token (401):
```http
GET {{BASE_URL}}/auth/me
```

❌ Token inválido (401):
```http
GET {{BASE_URL}}/auth/me
Authorization: Bearer token_invalido
```

❌ Token expirado (401):
Usar un token generado hace más de 24h

---

## 4. Actualizar Perfil

### Request
```http
PUT {{BASE_URL}}/auth/profile
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nombre": "Test User Updated",
  "email": "testupdated@example.com"
}
```

### Tests Esperados
✓ Status: 200
✓ Response contiene datos actualizados

### Errores a Probar
❌ Email ya en uso (409):
```json
{ "email": "admin@energiaco2.com" }
```

❌ Sin autenticación (401):
```http
PUT {{BASE_URL}}/auth/profile
Content-Type: application/json

{ "nombre": "Test" }
```

---

## 5. Cambiar Contraseña

### Request
```http
PUT {{BASE_URL}}/auth/change-password
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currentPassword": "Test123!@#",
  "newPassword": "NewPassword123!@#",
  "confirmNewPassword": "NewPassword123!@#"
}
```

### Tests Esperados
✓ Status: 200
✓ Debe poder hacer login con nueva contraseña
✓ No debe poder hacer login con contraseña anterior

### Errores a Probar
❌ Contraseña actual incorrecta (401):
```json
{
  "currentPassword": "WrongPassword123!",
  "newPassword": "NewPassword123!@#",
  "confirmNewPassword": "NewPassword123!@#"
}
```

❌ Nueva contraseña igual a actual (400):
```json
{
  "currentPassword": "Test123!@#",
  "newPassword": "Test123!@#",
  "confirmNewPassword": "Test123!@#"
}
```

❌ Contraseñas no coinciden (400):
```json
{
  "currentPassword": "Test123!@#",
  "newPassword": "NewPassword123!@#",
  "confirmNewPassword": "Different123!@#"
}
```

---

## 6. Logout

### Request
```http
POST {{BASE_URL}}/auth/logout
Authorization: Bearer {{TOKEN}}
```

### Tests Esperados
✓ Status: 200
✓ Cliente debe eliminar el token

---

## 7. Rate Limiting

### Test: Login Rate Limit
1. Hacer 5 intentos de login fallidos
2. El 6to intento debe retornar 429
3. Esperar 15 minutos
4. Debe permitir intentar de nuevo

### Test: Register Rate Limit
1. Crear 3 usuarios nuevos
2. El 4to intento debe retornar 429
3. Esperar 1 hora
4. Debe permitir registrar de nuevo

---

## 8. Autorización por Roles

### Test: Acceso Admin (preparado para Semana 3)
```http
GET {{BASE_URL}}/admin/users
Authorization: Bearer {{USER_TOKEN}}
```
❌ Debe retornar 403

```http
GET {{BASE_URL}}/admin/users
Authorization: Bearer {{ADMIN_TOKEN}}
```
✓ Debe retornar 200

---

## Scripts de Testing Automatizado

### Usando PowerShell

```powershell
# Registro
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    nombre = "Test User"
    email = "test@example.com"
    password = "Test123!@#"
    confirmPassword = "Test123!@#"
  } | ConvertTo-Json)

$token = $response.data.token
Write-Host "Token: $token"

# Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    email = "test@example.com"
    password = "Test123!@#"
  } | ConvertTo-Json)

# Get Me
$headers = @{ Authorization = "Bearer $($loginResponse.data.token)" }
$me = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" `
  -Method GET `
  -Headers $headers

Write-Host "Usuario: $($me.data.nombre)"
```

### Usando cURL

```bash
# Registro y capturar token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@example.com","password":"Test123!@#","confirmPassword":"Test123!@#"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"

# Get Me
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Checklist de Testing

### Funcionalidad
- [ ] Registro exitoso crea usuario y wallet
- [ ] Login exitoso retorna token válido
- [ ] Token permite acceso a rutas protegidas
- [ ] Token expirado rechazado
- [ ] Token inválido rechazado
- [ ] Actualización de perfil funciona
- [ ] Cambio de contraseña funciona
- [ ] Usuario suspendido no puede hacer login
- [ ] Usuario inactivo no puede hacer login

### Validaciones
- [ ] Email inválido rechazado
- [ ] Password débil rechazado
- [ ] Passwords no coincidentes rechazados
- [ ] Email duplicado rechazado
- [ ] Contraseña actual incorrecta rechazada
- [ ] Nueva contraseña igual a actual rechazada

### Seguridad
- [ ] Contraseñas hasheadas en BD
- [ ] Contraseñas no retornadas en responses
- [ ] Rate limiting funciona en login
- [ ] Rate limiting funciona en registro
- [ ] JWT firmado correctamente
- [ ] Estados de usuario verificados

### Performance
- [ ] Login responde en < 500ms
- [ ] Registro responde en < 1s
- [ ] Get me responde en < 200ms

---

## Datos de Prueba

### Usuario Admin (del seed)
```
Email: admin@energiaco2.com
Password: admin123
```

### Usuario Normal (del seed)
```
Email: maria@example.com
Password: user123
```

```
Email: juan@example.com
Password: user123
```

**Nota**: Las contraseñas del seed NO cumplen la política de password fuerte.
Para testing con passwords fuertes, usa: `Admin123!@#` o `User123!@#`
