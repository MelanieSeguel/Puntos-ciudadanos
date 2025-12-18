# Configuración para desarrollo local

## Cambiar la IP del Backend

En el archivo `src/services/api.js`, línea 5:

```javascript
const API_URL = 'http://192.168.1.100:3000/api/v1';
```

Cambia `192.168.1.100` por tu IP local. Para encontrarla:

**Windows:**
```powershell
ipconfig
# Busca "Dirección IPv4" en tu adaptador de red activo
```

**Mac/Linux:**
```bash
ifconfig
# Busca "inet" en tu interfaz de red activa (usualmente en0 o wlan0)
```

**Nota:** No uses `localhost` ni `127.0.0.1` porque en React Native Expo estas direcciones apuntan al dispositivo móvil, no a tu computadora.

## Usuarios de Prueba

### Usuario Normal
- Email: `maria@example.com`
- Password: `user123`
- Rol: `USER`

### Comercio
- Email: `mati@mechada.com`
- Password: `merchant123`
- Rol: `MERCHANT`

### Administrador
- Email: `admin@energiaco2.com`
- Password: `admin123`
- Rol: `ADMIN`

## Cómo correr la app

```bash
cd client
npm start
```

Luego:
- Presiona `a` para Android
- Presiona `i` para iOS
- Escanea el QR con la app Expo Go en tu celular
