# Tareas Pendientes para el Frontend Mobile

## Estado Actual
El frontend móvil con React Native + Expo aún no ha sido creado en este workspace. Estas son las implementaciones pendientes una vez que se cree el directorio `client/`.

---

## 📱 Paso 2: Inteligencia en el Frontend (Roles)

### Contexto
La App Móvil necesita saber si quien se logueó es "Juan Pérez" (Usuario) o "Mati Mechada" (Comercio), porque ven pantallas distintas.

### Archivo a Modificar: `client/context/AuthContext.js`

**Objetivo:** Guardar el rol del usuario cuando hace login para condicionar la UI.

```javascript
// En tu función login (dentro de AuthContext.js)
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data; // Ajustar según estructura del backend
    
    // Guardamos todo en el estado
    setAuthState({
      token: token,
      authenticated: true,
      user: user,
      role: user.rol // <--- ¡IMPORTANTE! Guardar el rol (USER, ADMIN, MERCHANT)
    });
    
    // Guardar en almacenamiento local (AsyncStorage)
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userRole', user.rol); 
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    
    // Configurar header de axios para futuras peticiones
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
  } catch (error) {
    throw error;
  }
};

// También en la función de inicialización (al abrir la app)
const loadStoredAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const role = await AsyncStorage.getItem('userRole');
    const userData = await AsyncStorage.getItem('userData');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      setAuthState({
        token,
        authenticated: true,
        user,
        role: role || user.rol
      });
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error loading auth:', error);
  }
};
```

---

## 📷 Paso 3: El "Súper Escáner" (Frontend)

### Contexto
La pantalla `scan.js` debe ser inteligente según el rol del usuario:

- **Si soy USER**: Escaneo QR para ganar puntos (RECICLAR:50, VOLUNTARIADO:100, etc.)
- **Si soy MERCHANT**: Escaneo QR de cupones de clientes (UUID) para validarlos

### Archivo a Modificar: `client/app/(tabs)/scan.js`

**Lógica condicional:**

```javascript
import { useState, useEffect, useContext } from 'react';
import { CameraView, Camera } from 'expo-camera';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { authState } = useContext(AuthContext);
  const user = authState?.user;
  const userRole = authState?.role || user?.rol;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);

    try {
      if (userRole === 'MERCHANT') {
        // --- Lógica de Comercio (Validar Cupón) ---
        const response = await api.post('/merchant/validate-qr', { 
          transactionId: data 
        });
        
        const beneficio = response.data.data.beneficio;
        const cliente = response.data.data.cliente;
        
        Alert.alert(
          '✅ Cupón Validado', 
          `Entregar: ${beneficio}\nCliente: ${cliente}`,
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        
      } else {
        // --- Lógica de Usuario (Ganar Puntos) ---
        // data suele ser "RECICLAR:50" o "VOLUNTARIADO:100"
        const response = await api.post('/points/scan', { qrCode: data });
        
        const puntos = response.data.data.puntosGanados || response.data.data.points;
        
        Alert.alert(
          '🎉 ¡Puntos Ganados!', 
          `Has sumado ${puntos} puntos`,
          [{ text: 'Genial', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Código no válido';
      Alert.alert('❌ Error', errorMsg, [
        { text: 'Reintentar', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando permiso de cámara...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>Sin acceso a la cámara</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>
            {userRole === 'MERCHANT' 
              ? '📱 Escanea el cupón del cliente' 
              : '♻️ Escanea código QR para ganar puntos'}
          </Text>
          
          {scanned && (
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.buttonText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## 🧪 Testing del Flujo Completo

### Escenario 1: Usuario Normal (Juan Pérez)
1. Login con `juan@example.com` / `user123`
2. Verificar que `authState.role === 'USER'`
3. Ir a tab "Escanear"
4. Escanear QR: `RECICLAR:50`
5. Debe llamar a `POST /api/v1/points/scan`
6. Mostrar: "🎉 ¡Has sumado 50 puntos!"

### Escenario 2: Comercio (Mati Mechada)
1. Login con `mati@mechada.com` / `merchant123`
2. Verificar que `authState.role === 'MERCHANT'`
3. Ir a tab "Escanear"
4. Cliente muestra su QR con UUID del cupón
5. Escanear QR: `550e8400-e29b-41d4-a716-446655440000`
6. Debe llamar a `POST /api/v1/merchant/validate-qr`
7. Mostrar: "✅ Cupón Validado - Entregar: Pizza 2x1 - Cliente: Juan Pérez"

---

## 📋 Checklist de Implementación

- [ ] Crear directorio `client/` con Expo
- [ ] Implementar `AuthContext.js` con manejo de roles
- [ ] Modificar `scan.js` con lógica condicional por rol
- [ ] Instalar dependencias: `expo-camera`, `@react-native-async-storage/async-storage`
- [ ] Configurar `api.js` con interceptors para token
- [ ] Crear navegación condicional (User ve tabs distintos que Merchant)
- [ ] Testing manual con ambos roles
- [ ] Validar persistencia de sesión al cerrar/abrir app

---

## 🎯 Beneficios de Esta Arquitectura

1. **Un solo escáner para dos propósitos** (DRY principle)
2. **Roles manejados desde el backend** (seguridad)
3. **UI adaptable** según tipo de usuario
4. **Código reutilizable** (misma cámara, distinto handler)
5. **Escalable** (fácil agregar rol ADMIN con más funciones)

---

## 🔗 Endpoints Utilizados

### Para Usuarios (USER)
```
POST /api/v1/points/scan
Body: { "qrCode": "RECICLAR:50" }
```

### Para Comercios (MERCHANT)
```
POST /api/v1/merchant/validate-qr
Body: { "transactionId": "uuid-del-cupon" }
```

Ambos requieren header:
```
Authorization: Bearer {token}
```

---

**Nota:** Este documento debe eliminarse una vez que el frontend esté implementado y testeado.
