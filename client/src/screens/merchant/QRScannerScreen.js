import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function QRScannerScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [validating, setValidating] = useState(false);

  // Si los permisos aún no se han cargado
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  // Si no hay permisos, solicitarlos
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para escanear códigos QR
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir Acceso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Manejar escaneo de QR
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    setValidating(true);

    console.log('[QRScanner] Código escaneado:', data);
    console.log('[QRScanner] Tipo:', type);

    try {
      // Enviar el QR al backend
      const response = await api.post('/merchant/validate-qr', {
        qrCode: data, // El backend espera 'qrCode', no 'transactionId'
      });

      console.log('[QRScanner] Respuesta del servidor:', response.data);

      // El backend devuelve datos anidados: user, benefit, etc.
      const { user, benefit, pointsCharged } = response.data.data;

      // Mostrar alerta de éxito
      Alert.alert(
        'Cupón Validado', 
        `Cliente: ${user.name}\nBeneficio: ${benefit.title}\nPuntos: ${benefit.pointsCost}`, 
        [
          {
            text: 'Aceptar',
            onPress: () => {
              setScanned(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[QRScanner] Error completo:', error);
      console.error('[QRScanner] Respuesta error:', error.response?.data);
      
      let errorMessage = 'Error al validar el cupón';
      
      // Intentar obtener el mensaje de error del backend
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mensajes personalizados según el tipo de error
      if (errorMessage.toLowerCase().includes('ya fue validado') || 
          errorMessage.toLowerCase().includes('redeemed')) {
        errorMessage = 'Este cupón ya fue validado previamente';
      } else if (errorMessage.toLowerCase().includes('expirado') || 
                 errorMessage.toLowerCase().includes('expired')) {
        errorMessage = 'Este cupón ha expirado';
      } else if (errorMessage.toLowerCase().includes('no encontrado') || 
                 errorMessage.toLowerCase().includes('not found')) {
        errorMessage = 'Cupón no encontrado o inválido';
      }

      // Mostrar alerta de error
      Alert.alert('Error al Validar', errorMessage, [
        {
          text: 'Intentar de nuevo',
          onPress: () => setScanned(false),
        },
        {
          text: 'Volver',
          onPress: () => {
            setScanned(false);
            navigation.goBack();
          },
        },
      ]);
    } finally {
      setValidating(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay con marco de escaneo */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.focusedRow}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.focusedContainer}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>
          <View style={styles.unfocusedContainer} />

          {/* Header con título y botón cerrar */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Escanear Cupón</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Footer con instrucciones */}
          <View style={styles.footer}>
            <Text style={styles.instructionText}>
              Apunta tu cámara al código QR
            </Text>
            {validating && (
              <View style={styles.validatingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.validatingText}>Validando...</Text>
              </View>
            )}
          </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
  },
  focusedRow: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FF9800',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FF9800',
  },
  cornerTopRight: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FF9800',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FF9800',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FF9800',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  validatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  validatingText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
  },
});
