import React from 'react';
import { View, StyleSheet } from 'react-native';
import PrimaryButton from '../common/PrimaryButton';

/**
 * Botones de acceso rápido
 * @param {function} onScanQR - Callback para escanear QR
 * @param {function} onViewCatalog - Callback para ver catálogo
 * @param {boolean} vertical - Si es vertical u horizontal
 */
export default function QuickActionsButtons({ 
  onScanQR = () => {}, 
  onViewCatalog = () => {},
  vertical = false 
}) {
  return (
    <View style={vertical ? styles.containerVertical : styles.containerHorizontal}>
      <View style={styles.buttonWrapper}>
        <PrimaryButton
          title="Escanear QR"
          onPress={onScanQR}
          backgroundColor="#4CAF50"
        />
      </View>
      <View style={styles.buttonWrapper}>
        <PrimaryButton
          title="Ver Catálogo"
          onPress={onViewCatalog}
          backgroundColor="#2196F3"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  containerVertical: {
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});
