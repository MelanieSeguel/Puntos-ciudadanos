import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/common/ScreenHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import InfoBox from '../../components/common/InfoBox';

export default function EarnPointsScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Gana Puntos"
        subtitle="Escanea códigos QR para ganar puntos"
        backgroundColor="#4CAF50"
      />

      <View style={styles.content}>
        <View style={styles.scanArea}>
          <Ionicons name="qr-code-outline" size={64} color="#4CAF50" />
          <Text style={styles.scanText}>Escáner QR</Text>
          <PrimaryButton
            title="Abrir Cámara"
            onPress={() => {}}
            backgroundColor="#4CAF50"
          />
        </View>

        <InfoBox
          icon="bulb-outline"
          title="¿Cómo ganar puntos?"
          message="• Escanea códigos QR en comercios participantes&#10;• Participa en eventos comunitarios&#10;• Completa misiones ciudadanas"
          backgroundColor="#E8F5E9"
          textColor="#2E7D32"
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
});
