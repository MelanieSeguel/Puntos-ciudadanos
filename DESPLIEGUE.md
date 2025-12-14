# Instrucciones de Despliegue - Semana 1

## 📦 Instalación y Puesta en Marcha

### Opción 1: Con Docker (Recomendado)

1. **Instalar dependencias localmente** (solo para Prisma):
```powershell
npm install
```

2. **Levantar los contenedores**:
```powershell
docker-compose up --build
```

3. **En otra terminal, ejecutar migraciones**:
```powershell
docker exec -it puntos_ciudadanos_app npx prisma migrate dev --name init
```

4. **(Opcional) Poblar con datos de prueba**:
```powershell
docker exec -it puntos_ciudadanos_app npm run prisma:seed
```

5. **Verificar que funciona**:
- Health check: http://localhost:3000/health
- API Info: http://localhost:3000/api/v1

### Opción 2: Sin Docker (Desarrollo Local)

1. **Asegurarte de tener PostgreSQL instalado y corriendo localmente**

2. **Actualizar .env** con tu conexión local:
```
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/puntos_ciudadanos?schema=public"
```

3. **Instalar dependencias**:
```powershell
npm install
```

4. **Generar Prisma Client**:
```powershell
npm run prisma:generate
```

5. **Ejecutar migraciones**:
```powershell
npm run prisma:migrate
```

6. **(Opcional) Poblar datos de prueba**:
```powershell
npm run prisma:seed
```

7. **Iniciar servidor**:
```powershell
npm run dev
```

## 🧪 Verificación

### 1. Health Check
```powershell
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2025-12-14T...",
  "uptime": 23.45,
  "environment": "development",
  "database": "connected"
}
```

### 2. API Info
```powershell
curl http://localhost:3000/api/v1
```

### 3. Prisma Studio (Explorar BD)
```powershell
npm run prisma:studio
```
Se abre en http://localhost:5555

## 🗄️ Verificar Base de Datos

### Conectar a PostgreSQL (Docker):
```powershell
docker exec -it puntos_ciudadanos_db psql -U puntos_user -d puntos_ciudadanos
```

### Listar tablas:
```sql
\dt
```

Deberías ver:
- users
- wallets
- point_transactions
- benefits
- news

### Ver datos de ejemplo:
```sql
SELECT * FROM users;
SELECT * FROM wallets;
SELECT * FROM benefits;
```

## 🛑 Detener Servicios

```powershell
docker-compose down
```

## 🔄 Reiniciar Limpio

```powershell
# Detener y eliminar volúmenes
docker-compose down -v

# Levantar de nuevo
docker-compose up --build

# Ejecutar migraciones
docker exec -it puntos_ciudadanos_app npx prisma migrate dev --name init

# Seed
docker exec -it puntos_ciudadanos_app npm run prisma:seed
```

## ⚠️ Solución de Problemas Comunes

### Puerto 3000 o 5432 ya en uso
```powershell
# Encontrar proceso usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Matar proceso (reemplazar PID)
taskkill /PID <número_pid> /F
```

### Error de conexión a base de datos
1. Verificar que el contenedor de PostgreSQL esté corriendo:
```powershell
docker ps
```

2. Ver logs:
```powershell
docker-compose logs postgres
```

3. Esperar a que PostgreSQL termine de inicializar (30 segundos aprox)

### Prisma Client no generado
```powershell
npm run prisma:generate
```

## 📊 Estructura Creada

```
puntos-ciudadanos/
├── prisma/
│   ├── schema.prisma       ✅ Modelos definidos
│   └── seed.js             ✅ Datos de prueba
├── src/
│   ├── config/
│   │   ├── database.js     ✅ Conexión Prisma
│   │   └── index.js        ✅ Configuración general
│   └── server.js           ✅ Servidor Express
├── .dockerignore           ✅
├── .env                    ✅
├── .env.example            ✅
├── .gitignore              ✅
├── docker-compose.yml      ✅
├── Dockerfile              ✅
├── package.json            ✅
└── README.md               ✅
```

## ✅ Checklist Semana 1

- [x] Docker Compose configurado (Node + PostgreSQL)
- [x] Volúmenes persistentes para datos
- [x] Red de Docker configurada
- [x] Health checks implementados
- [x] Prisma configurado como ORM
- [x] 5 Modelos creados (Users, Wallets, PointTransactions, Benefits, News)
- [x] Relaciones 1:1 y 1:N establecidas
- [x] Servidor Express configurado
- [x] Middleware de seguridad (Helmet, CORS, Rate Limiting)
- [x] Conexión a base de datos
- [x] Arquitectura base MVC preparada
- [x] Seed con datos de prueba
- [x] README con documentación

## 🎯 Próximos Pasos (Semana 2)

La infraestructura está lista para comenzar a implementar:
- Autenticación (JWT)
- CRUD de usuarios
- Sistema de puntos
- Gestión de beneficios
- Noticias

---

**¿Dudas o problemas?** Revisa los logs con:
```powershell
docker-compose logs -f
```
