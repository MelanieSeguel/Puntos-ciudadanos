/**
 * ScannerScreen - Pantalla de validación de cupones
 * Permite escanear QR/códigos de validación
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';
import { merchantAPI } from '../../services/api';

export default function ScannerScreen() {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);
  const isWeb = Platform.OS === 'web';

  const handleValidate = async () => {
    if (!qrCode.trim()) {
      Alert.alert('Error', 'Ingresa o escanea un código QR');
      return;
    }

    try {
      setLoading(true);
      console.log('[ScannerScreen] Validando QR:', qrCode);
      
      const response = await merchantAPI.validateQR(qrCode);
      console.log('[ScannerScreen] Respuesta:', response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        setLastValidation(data);
        
        Alert.alert(
          '✅ Cupón Validado',
          `Cliente: ${data.userName}\nBeneficio: ${data.benefitTitle}\nPuntos: ${data.pointsCost}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setQrCode('');
                setLastValidation(null);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('[ScannerScreen] Error validando:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al validar cupón';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Validar Cupón</Text>
        <Text style={styles.subtitle}>
          {isWeb ? 'Ingresa el código QR del cliente' : 'Escanea el código QR del cliente'}
        </Text>
      </View>

      {/* En Web: Input manual del código */}
      {isWeb && (
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.merchant} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={qrCode}
            onChangeText={setQrCode}
            placeholder="Código QR o ID de transacción"
            placeholderTextColor={COLORS.gray}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {qrCode.length > 0 && (
            <TouchableOpacity onPress={() => setQrCode('')} style={styles.clearButton}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* En Móvil: Área de escaneo - cámara */}
      {!isWeb && (
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
      )}

      {/* Última validación exitosa */}
      {lastValidation && (
        <View style={styles.successBox}>
          <MaterialCommunityIcons name="check-circle" size={32} color={COLORS.success} />
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>¡Validado!</Text>
            <Text style={styles.successText}>
              Cliente: {lastValidation.userName}
            </Text>
            <Text style={styles.successText}>
              Beneficio: {lastValidation.benefitTitle}
            </Text>
            <Text style={styles.successPoints}>
              {lastValidation.pointsCost} puntos
            </Text>
          </View>
        </View>
      )}

      {/* Botón para procesar escaneo */}
      <TouchableOpacity 
        style={[styles.scanButton, loading && styles.scanButtonDisabled]} 
        onPress={handleValidate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            <MaterialCommunityIcons 
              name={isWeb ? "check-circle" : "camera-plus"} 
              size={24} 
              color={COLORS.white} 
            />
            <Text style={styles.scanButtonText}>
              {isWeb ? 'Validar Cupón' : 'Procesar Escaneo'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Información */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} style={styles.infoIcon} />
        <View>
          <Text style={styles.infoTitle}>Información</Text>
          <Text style={styles.infoText}>
            {isWeb 
              ? '• Ingresa el código QR del cliente\n• Validación en tiempo real\n• Historial automático'
              : '• Escanea códigos QR válidos\n• Validación en tiempo real\n• Historial automático'
            }
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
  // Estilos para input manual (Web)
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.merchant,
    ...LAYOUT.shadowMedium,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.body1,
    color: COLORS.dark,
    paddingVertical: SPACING.sm,
    outlineStyle: 'none', // Para web
  },
  clearButton: {
    padding: SPACING.xs,
  },
  // Estilos para scanner de cámara (Móvil)
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
  // Success box
  successBox: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    ...LAYOUT.shadowMedium,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  successText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  successPoints: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.merchant,
    marginTop: SPACING.xs,
  },
  // Botón de validación
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
  scanButtonDisabled: {
    opacity: 0.6,
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
