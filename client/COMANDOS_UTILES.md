# 🚀 Comandos Útiles - Desarrollo Puntos Ciudadanos

## 🔧 Setup Inicial

```bash
# Instalar dependencias
cd client
npm install

# Limpiar caché de Expo
expo start --clear

# Limpiar módulos de node_modules
rm -rf node_modules
npm install

# Instalar versión específica de paquete
npm install react-native-safe-area-context@5.6.0
```

## 📱 Ejecutar la App

```bash
# Iniciar servidor de desarrollo
expo start

# En iOS (si tienes Mac)
expo start --ios

# En Android
expo start --android

# En web
expo start --web

# Con opción de limpiar caché
expo start --clear

# Especificar puerto
expo start --port 8082
```

## 🔍 Testing & Debugging

```bash
# Ver logs de la app
expo logs

# Abrir DevTools de React Native
# Presionar 'd' en terminal cuando app está corriendo

# Inspeccionar estado de AsyncStorage
# En simulador: Android Studio Device File Explorer
# En web: DevTools > Application > Local Storage

# Ver errores en tiempo real
# Presionar 'e' en terminal para mostrar errores

# Recargar app
# Presionar 'r' en terminal

# Mostrar menú
# Presionar 'm' en terminal
```

## 📝 Git Commands

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Agregar validación en LoginScreen"

# Ver cambios recientes
git log --oneline -10

# Revertir un cambio
git revert HEAD

# Stash temporal
git stash
git stash pop
```

## 🧪 Pruebas Manuales

### Test de Login

```bash
# Credenciales válidas
Email: maria@example.com
Password: user123

# Esperado: Entrar a app como usuario regular

# Credenciales inválidas
Email: maria@example.com
Password: wrongpassword

# Esperado: Error "Email o contraseña incorrectos"

# Email inválido
Email: invalidemail
Password: user123

# Esperado: Error en validación "Email inválido"
```

### Test de Validación

```bash
# LoginScreen - Email vacío
- Dejar campo vacío
- Click en Iniciar Sesión
Esperado: Error "El email es requerido"

# LoginScreen - Contraseña corta
- Email: maria@example.com
- Contraseña: 123
- Click en Iniciar Sesión
Esperado: Error "La contraseña debe tener mínimo 6 caracteres"

# RegisterScreen - Nombres no coinciden
- Password: password123
- Confirmar: password124
Esperado: Error "Las contraseñas no coinciden"
```

## 🐛 Debugging

### Ver estado de autenticación

```javascript
// En cualquier pantalla
import { AuthContext } from '../context/AuthContext';

const { authState } = useContext(AuthContext);
console.log('Auth State:', authState);
// Mostrará: { token, authenticated, user, role, loading, error }
```

### Ver errores de API

```javascript
// En LoginScreen
try {
  await login(email, password);
} catch (error) {
  console.log('Full Error:', error);
  console.log('Response:', error.response?.data);
  console.log('Status:', error.response?.status);
}
```

### Inspeccionar tokens

```javascript
// En la consola del navegador (web) o terminal (mobile)
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('userToken');
console.log('Token:', token);
```

## 📊 Ver estructura del proyecto

```bash
# Listar archivos de forma árbol
tree -L 3 -I 'node_modules'

# O con PowerShell (Windows)
Get-ChildItem -Recurse -Depth 3 -Exclude node_modules | Format-List Name

# Contar líneas de código
find src -name "*.js" -type f | xargs wc -l
```

## 🔒 Variables de Entorno

### Crear `.env` en root del proyecto

```bash
# .env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.82:3000/api/v1
EXPO_PUBLIC_APP_NAME=Puntos Ciudadanos
```

### Usar en código

```javascript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
```

## 📦 Instalar Nuevas Dependencias

```bash
# Instalar paquete
npm install nombre-paquete

# Instalar versión específica
npm install nombre-paquete@1.2.3

# Instalar y guardar en devDependencies
npm install --save-dev nombre-paquete

# Ver dependencias desactualizadas
npm outdated

# Actualizar todas las dependencias
npm update
```

## 🎨 Cambios en Tema

Si modificas `src/theme/theme.js`:

```bash
# Recargar app para ver cambios
# Presiona 'r' en terminal

# Si no funciona, limpiar caché
expo start --clear
```

## 📱 Simulador/Emulador

### Android

```bash
# Abrir Android Studio
# Tools → AVD Manager → Play button

# Luego ejecutar
expo start --android

# O directamente
adb devices  # Ver dispositivos conectados
```

### iOS (solo en Mac)

```bash
# Abrir Xcode simulador
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app

# Luego ejecutar
expo start --ios
```

## 🔄 Sincronizar Cambios

```bash
# Pull más reciente
git pull origin main

# Push de cambios locales
git push origin main

# Resolver conflictos
git status  # Ver archivos con conflictos
# Editar archivos
git add .
git commit -m "resolve: Conflictos resueltos"
git push
```

## 📚 Ver Logs Detallados

```bash
# En terminal durante expo start
# Ver todos los logs
expo logs -c

# O usar --verbose
expo start --verbose

# En Android device
adb logcat | grep Expo
```

## 🚨 Solucionar Problemas Comunes

### Puerto en uso

```bash
# Kill proceso en puerto 8081 (Windows)
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# O usar otro puerto
expo start --port 8082
```

### Cache corrompido

```bash
# Limpiar todo el caché
rm -rf node_modules
rm package-lock.json
npm install
expo start --clear
```

### Módulos faltantes

```bash
# Ver qué está instalado
npm list

# Instalar específicamente
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
npm install axios
npm install @expo/vector-icons
npm install react-native-safe-area-context
```

## 📈 Analizar Performance

```javascript
// En pantalla, agregar:
import { PerformanceMonitor } from '@react-native-performance/monitor';

// Medir tiempo de renderizado
console.time('LoginScreen render');
// ... código ...
console.timeEnd('LoginScreen render');

// Resultado: ~50-100ms en buena performance
```

## 🎯 Tareas Comunes

### Cambiar URL de API

```javascript
// En src/services/api.js
// Cambiar:
const API_BASE_URL = 'http://192.168.1.82:3000/api/v1';
// A:
const API_BASE_URL = 'http://TU_IP:3000/api/v1';
```

### Agregar nuevo validador

```javascript
// En src/utils/validators.js
export const validateCustom = (value) => {
  if (condition) {
    return { valid: false, error: 'Tu mensaje' };
  }
  return { valid: true, error: null };
};
```

### Agregar nuevo endpoint API

```javascript
// En src/services/api.js
export const newAPI = {
  methodName: async (params) => {
    return api.post('/endpoint', params);
  },
};

// Usar en pantalla:
import { newAPI } from '../services/api';
const response = await newAPI.methodName(data);
```

### Agregar nueva pantalla

```javascript
// 1. Crear componente en src/screens/MyNewScreen.js
// 2. Importar en navegador (ej: UserNavigator.js)
// 3. Agregar a Stack o Tabs:

<Tab.Screen name="Mi Pantalla" component={MyNewScreen} />

// 4. Navegar desde otra pantalla:
navigation.navigate('Mi Pantalla')
```

## 💾 Backup & Restore

```bash
# Crear backup del proyecto
tar -czf puntos-ciudadanos-backup.tar.gz .

# Restaurar
tar -xzf puntos-ciudadanos-backup.tar.gz
npm install
```

## 📊 Ver uso de memoria

```bash
# En Metro bundler (terminal)
# Presionar 's' para ver información de snapshot
# Presionar 'h' para ver todas las opciones

# O monitorear en dispositivo:
# Android: Android Studio → Profiler
# iOS: Xcode → Debug Navigator → Memory
```

## ✅ Checklist Pre-Deploy

```bash
# 1. Verificar validaciones
npm run test:validations

# 2. Verificar API connectivity
npm run test:api

# 3. Limpiar código
npm run lint

# 4. Compilar production
expo build:android  # o :ios

# 5. Verificar size
npm run analyze

# 6. Últimas pruebas
expo start --production

# 7. Commit final
git commit -m "chore: Ready for production"
```

---

**Última actualización**: 20/12/2024
**Versión**: 1.0
