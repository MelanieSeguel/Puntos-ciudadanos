/**
 * ScannerScreen - Pantalla de validación de cupones
 * Permite escanear QR/códigos de validación
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function ScannerScreen() {
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    Alert.alert(
      'Cupón Validado',
      'Cliente: Juan Pérez\nProducto: Pizza 2x1\nPuntos: 100',
      [
        {
          text: 'OK',
          onPress: () => {
            // Aquí iría la lógica real de escaneo
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Validar Cupón</Text>
        <Text style={styles.subtitle}>Escanea el código QR del cliente</Text>
      </View>

      {/* Área de escaneo - cámara */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerBox}>
          <View style={[styles.scannerCorner, styles.cornerTopLeft]} />
          <View style={[styles.scannerCorner, styles.cornerTopRight]} />
          <View style={[styles.scannerCorner, styles.cornerBottomLeft]} />
          <View style={[styles.scannerCorner, styles.cornerBottomRight]} />
          <MaterialCommunityIcons name="camera" size={48} color={COLORS.merchant} style={styles.scannerIcon} />
          <Text style={styles.scannerText}>Cámara</Text>
        </View>
        <Text style={styles.scannerInstruction}>
          Apunta tu cámara al código QR
        </Text>
      </View>

      {/* Botón para procesar escaneo */}
      <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
        <MaterialCommunityIcons name="camera-plus" size={24} color={COLORS.white} />
        <Text style={styles.scanButtonText}>Procesar Escaneo</Text>
      </TouchableOpacity>

      {/* Información */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} style={styles.infoIcon} />
        <View>
          <Text style={styles.infoTitle}>Información</Text>
          <Text style={styles.infoText}>
            • Escanea códigos QR válidos{'\n'}• Validación en tiempo real{'\n'}• Historial automático
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
  scannerContainer: {
    marginVertical: SPACING.xl,
    alignItems: 'center',
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.merchant,
    borderRadius: LAYOUT.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lighter,
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.merchant,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scannerIcon: {
    marginBottom: SPACING.sm,
  },
  scannerText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
  scannerInstruction: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginTop: SPACING.sm,
  },
  scanButton: {
    backgroundColor: COLORS.merchant,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    ...LAYOUT.shadowMedium,
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    lineHeight: 22,
  },
});
