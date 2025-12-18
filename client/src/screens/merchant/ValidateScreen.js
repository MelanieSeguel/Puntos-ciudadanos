import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/common/ScreenHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import InfoBox from '../../components/common/InfoBox';

export default function ValidateScreen() {
  const [qrCode, setQrCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!qrCode.trim()) {
      Alert.alert('Error', 'Ingresa un código QR válido');
      return;
    }

    setIsValidating(true);
    // TODO: Conectar con /merchant/validate-qr
    setTimeout(() => {
      setIsValidating(false);
      Alert.alert('Éxito', 'QR validado correctamente');
      setQrCode('');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Validar QR"
        subtitle="Escanea o ingresa el código del cliente"
        backgroundColor="#FF9800"
      />

      <View style={styles.content}>
        <View style={styles.scanArea}>
          <Ionicons name="camera-outline" size={64} color="#FF9800" />
          <Text style={styles.scanText}>Escáner QR</Text>
          <PrimaryButton
            title="Abrir Cámara"
            onPress={() => Alert.alert('Info', 'Cámara próximamente')}
            backgroundColor="#FF9800"
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.manualInput}>
          <Text style={styles.inputLabel}>Código Manual</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el código QR"
            value={qrCode}
            onChangeText={setQrCode}
            autoCapitalize="none"
          />
          <PrimaryButton
            title={isValidating ? 'Validando...' : 'Validar Código'}
            onPress={handleValidate}
            disabled={!qrCode.trim()}
            loading={isValidating}
            backgroundColor="#FF9800"
          />
        </View>

        <InfoBox
          icon="help-circle-outline"
          title="¿Cómo validar?"
          message="1. Solicita al cliente mostrar su código QR&#10;2. Escanea con la cámara o ingresa manualmente&#10;3. Los puntos se acreditarán automáticamente"
          backgroundColor="#FFF3E0"
          textColor="#E65100"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scanArea: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  manualInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
});
