# Puntos Ciudadanos - Frontend

Aplicación móvil y web construida con React Native + Expo.

## 🚀 Características

- ✅ **Multiplataforma**: Un solo código para iOS, Android y Web
- 🔐 **Autenticación**: Login y registro integrados con API backend
- 💳 **Wallet Digital**: Visualización de saldo en tiempo real
- 🎁 **Catálogo de Beneficios**: Canjes con confirmación
- 📊 **Historial**: Transacciones y estadísticas
- 📱 **Responsive**: Diseño adaptativo mobile/desktop
- 🎨 **UI Moderna**: Gradientes, sombras y animaciones

## 📋 Requisitos Previos

- Node.js 18+
- Backend corriendo en `http://localhost:3000`

## 🛠️ Instalación

```bash
cd client
npm install
```

## 🏃 Ejecutar la Aplicación

### Web
```bash
npm run web
```
La app abrirá en `http://localhost:8081`

### Móvil (con Expo Go)
```bash
npm start
```
Escanea el QR con Expo Go app:
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### iOS Simulator (macOS)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

## 📱 Pantallas Implementadas

### Autenticación
- **Login**: Email + contraseña
- **Registro**: Formulario completo

### App Principal (Tabs)
- **Home**: Wallet card, acciones para ganar puntos, feed de noticias
- **Beneficios**: Catálogo con filtros y canje
- **Escanear**: QR scanner (placeholder)
- **Perfil**: Información de usuario y configuración

## 🔌 Integración con API

El frontend se conecta automáticamente al backend en `http://localhost:3000/api/v1`

### Endpoints Utilizados
- `POST /auth/login` - Autenticación
- `POST /auth/register` - Registro
- `GET /auth/profile` - Perfil del usuario
- `GET /wallet/balance` - Saldo y transacciones
- `GET /wallet/transactions` - Historial completo
- `POST /points/redeem` - Canjear beneficio
- `GET /benefits` - Listar beneficios

## 🎨 Estructura del Proyecto

```
client/
├── app/                    # Rutas Expo Router
│   ├── (auth)/            # Pantallas de autenticación
│   │   ├── login.js
│   │   └── register.js
│   ├── (tabs)/            # Pantallas principales
│   │   ├── home.js
│   │   ├── benefits.js
│   │   ├── scan.js
│   │   └── profile.js
│   ├── _layout.js         # Layout raíz
│   └── index.js           # Punto de entrada
├── components/            # Componentes reutilizables
│   └── WalletCard.js
├── context/               # Context API
│   └── AuthContext.js
├── services/              # API client
│   └── api.js
└── assets/                # Imágenes e iconos
```

## 🔐 Configuración

### Variables de Entorno

Crea un archivo `.env` en la carpeta `client/`:

```env
API_URL=http://localhost:3000/api/v1
```

## 🎯 Testing

### Credenciales de Prueba

Usa las credenciales del backend:

```
Email: melanie.seguel@example.com
Password: Password123!
```

### Flujo de Prueba

1. **Login** con credenciales de prueba
2. **Ver saldo** en Wallet Card (debe mostrar puntos)
3. **Ir a Beneficios** y canjear uno
4. **Verificar** que el saldo disminuyó
5. **Ver Perfil** y cerrar sesión

## 🚧 Próximas Características

- [ ] QR Scanner funcional con cámara
- [ ] Push notifications
- [ ] Modo oscuro
- [ ] Historial de transacciones completo
- [ ] Filtros avanzados en beneficios
- [ ] Perfil editable
- [ ] Compartir logros en redes sociales
- [ ] Gamificación con niveles

## 📱 Compatibilidad

- **iOS**: 13+
- **Android**: 5.0+ (API 21)
- **Web**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)

## 🐛 Troubleshooting

### La app no conecta al backend
- Verifica que el backend esté corriendo en `localhost:3000`
- En Android emulator usa `10.0.2.2:3000` en lugar de `localhost:3000`
- En dispositivo físico usa la IP local de tu computadora

### Errores de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Cache de Expo
```bash
npx expo start -c
```

## 📄 Licencia

Proyecto académico - Universidad XYZ
