import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { pointsAPI } from '../../services/api';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || processing) return;
    
    setScanned(true);
    setProcessing(true);
    
    try {
      const result = await pointsAPI.addPoints({ qrCode: data });
      
      Alert.alert(
        '¡Puntos Ganados!',
        `+${result.data.transaccion.monto} puntos\n${result.data.transaccion.descripcion}\n\nSaldo actual: ${result.data.saldoActual} puntos`,
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudieron agregar los puntos',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            }
          }
        ]
      );
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Error', 'Ingresa un código válido');
      return;
    }

    setProcessing(true);
    
    try {
      const result = await pointsAPI.addPoints({ qrCode: manualCode.trim() });
      
      setModalVisible(false);
      setManualCode('');
      
      Alert.alert(
        '¡Puntos Ganados!',
        `+${result.data.transaccion.monto} puntos\n${result.data.transaccion.descripcion}\n\nSaldo actual: ${result.data.saldoActual} puntos`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Código inválido'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Escanear QR</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#38b2ac" />
          <Text style={styles.permissionText}>Solicitando permisos...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Escanear QR</Text>
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="camera-off" size={64} color="#fc8181" />
          <Text style={styles.permissionText}>Sin acceso a la cámara</Text>
          <Text style={styles.permissionSubtext}>
            Ve a Configuración y permite el acceso a la cámara
          </Text>
          <TouchableOpacity style={styles.manualButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.manualButtonText}>Ingresar código manualmente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escanear QR</Text>
      </View>

      <View style={styles.content}>
        {!scanning ? (
          <>
            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Ionicons name="qr-code" size={80} color="#38b2ac" />
            </View>

            <Text style={styles.instructionTitle}>Escanea un código QR</Text>
            <Text style={styles.instructionText}>
              Posiciona el código QR dentro del marco para ganar puntos por tus acciones ciudadanas
            </Text>

            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={() => setScanning(true)}
            >
              <Ionicons name="camera" size={24} color="#ffffff" />
              <Text style={styles.scanButtonText}>Abrir Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.manualButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.manualButtonText}>Ingresar código manualmente</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>
            </CameraView>

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                setScanning(false);
                setScanned(false);
              }}
            >
              <Ionicons name="close-circle" size={48} color="#ffffff" />
            </TouchableOpacity>

            {processing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.processingText}>Procesando...</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Modal for manual code entry */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ingresar Código</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#2d3748" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Código QR"
              placeholderTextColor="#a0aec0"
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity 
              style={[styles.submitButton, processing && styles.submitButtonDisabled]}
              onPress={handleManualSubmit}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a202c',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#1a202c',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scanArea: {
    width: 280,
    height: 280,
    marginTop: 40,
    marginBottom: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#38b2ac',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanIcon: {
    fontSize: 64,
    opacity: 0.5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 16,
    color: '#cbd5e0',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38b2ac',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: '100%',
    maxWidth: 300,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#a0aec0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#38b2ac',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  manualButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  manualButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
