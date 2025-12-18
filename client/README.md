# Puntos Ciudadanos - Frontend Mobile

Aplicación móvil desarrollada con React Native y Expo.

## Fase 1 Completada: Autenticación

### Características Implementadas

- **AuthContext robusto**: Manejo completo de autenticación con persistencia
- **Login funcional**: Pantalla de login que consume el backend
- **Persistencia de sesión**: Guarda token, usuario y rol en AsyncStorage
- **Carga automática**: Al abrir la app, verifica si hay sesión activa
- **Logout**: Limpia toda la información de autenticación
- **Pantalla Home**: Muestra información del usuario autenticado y su rol

### Estructura del Proyecto

```
client/
├── src/
│   ├── context/
│   │   └── AuthContext.js      # Contexto de autenticación
│   ├── screens/
│   │   ├── LoginScreen.js      # Pantalla de login
│   │   └── HomeScreen.js       # Pantalla principal
│   └── services/
│       └── api.js              # Configuración de axios y endpoints
├── App.js                       # Componente raíz
├── CONFIG.md                    # Guía de configuración
└── package.json
```

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd client
npm install
```

### 2. Configurar IP del Backend

Edita `src/services/api.js` y cambia la IP:

```javascript
const API_URL = 'http://TU_IP_LOCAL:3000/api/v1';
```

Para obtener tu IP:
```powershell
ipconfig  # Windows
ifconfig  # Mac/Linux
```

### 3. Correr la App

```bash
npm start
```

Opciones:
- Presiona `a` para Android Emulator
- Presiona `i` para iOS Simulator
- Escanea el QR con **Expo Go** en tu celular

## Cómo Probar

### 1. Login como Usuario Normal

```
Email: maria@example.com
Password: user123
```

Deberías ver:
- Pantalla de bienvenida con nombre "María González"
- Badge azul con "Rol: Usuario"
- Información del usuario
- Botón de cerrar sesión

### 2. Login como Comercio

```
Email: mati@mechada.com
Password: merchant123
```

Deberías ver:
- Pantalla de bienvenida con nombre del comercio
- Badge naranja con "Rol: Comercio"

### 3. Logout y Persistencia

1. Haz login
2. Cierra completamente la app (Force Close)
3. Vuelve a abrirla
4. Deberías seguir logueado (no pide login de nuevo)
5. Presiona "Cerrar Sesión"
6. Deberías volver a la pantalla de Login

## Tecnologías Utilizadas

- **React Native**: Framework para mobile apps
- **Expo**: Herramientas de desarrollo
- **Axios**: Cliente HTTP
- **AsyncStorage**: Almacenamiento local
- **Context API**: Manejo de estado global

## Endpoints Utilizados

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro (próximamente)

### Perfil
- `GET /auth/profile` - Obtener perfil del usuario

## Próximos Pasos (Fase 2)

- [ ] Agregar React Navigation
- [ ] Crear navegación por tabs (Home, Beneficios, Escanear, Perfil)
- [ ] Implementar pantalla de Wallet con saldo
- [ ] Mostrar historial de transacciones
- [ ] Agregar pantalla de registro

## Troubleshooting

### Error: Network Request Failed

**Problema**: No puede conectarse al backend

**Soluciones**:
1. Verifica que el backend esté corriendo (`docker-compose up`)
2. Verifica que la IP en `api.js` sea correcta
3. Verifica que tu celular y PC estén en la misma red WiFi
4. Desactiva firewall temporalmente para pruebas
5. En Windows: `netsh advfirewall firewall add rule name="Node" dir=in action=allow protocol=TCP localport=3000`

### Error: Cannot read property 'data' of undefined

**Problema**: La respuesta del backend no tiene la estructura esperada

**Solución**: Verifica que el backend esté actualizado y devuelva:
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": { ... }
  }
}
```

### La app no guarda la sesión

**Problema**: Siempre pide login al abrir

**Solución**:
1. Verifica que AsyncStorage esté instalado: `npm list @react-native-async-storage/async-storage`
2. Revisa la consola de Expo para errores
3. Borra el caché: `expo start --clear`

## Notas de Desarrollo

- El archivo `api.js` tiene interceptors que:
  - Agregan automáticamente el token a cada request
  - Manejan errores 401 (limpiando la sesión)
- El `AuthContext` usa `useEffect` para cargar la sesión al iniciar
- Los estilos están inline por ahora (refactorizar a StyleSheet centralizado en Fase 3)

---

**Estado**: Fase 1 Completada - Autenticación Funcional
