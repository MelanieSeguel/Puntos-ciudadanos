/**
 * QRCodeScreen - Código QR de Beneficio Canjeado
 * Pantalla que muestra el QR para redimir un beneficio en comercio
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function QRCodeScreen({ route, navigation }) {
  const { benefitId, benefitName, code } = route.params || {};

  const qrCode = code || 'QR-' + Date.now();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mi código de beneficio: ${qrCode}`,
        title: benefitName,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyCode = () => {
    // Por hacer: implementar portapapeles nativa
    // Clipboard.setString(qrCode);
    alert('Código copiado: ' + qrCode);
  };

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={styles.title}>Código QR</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Contenido Principal */}
        <View style={styles.content}>
          {/* Benefit Info */}
          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="gift" size={32} color={COLORS.primary} />
            <Text style={styles.benefitName}>{benefitName || 'Beneficio'}</Text>
            <Text style={styles.benefitSubtitle}>Listo para canjear</Text>
          </View>

          {/* Código QR - Redención */}
          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <MaterialCommunityIcons name="qrcode" size={100} color={COLORS.light} />
              <Text style={styles.qrText}>Código QR</Text>
            </View>
          </View>

          {/* Código */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Tu Código</Text>
            <View style={styles.codeBox}>
              <Text style={styles.code}>{qrCode}</Text>
              <TouchableOpacity onPress={handleCopyCode}>
                <MaterialCommunityIcons name="content-copy" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Instrucciones */}
          <View style={styles.instructions}>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View>
                <Text style={styles.stepTitle}>Muestra este código</Text>
                <Text style={styles.stepText}>Al comerciante en el punto de venta</Text>
              </View>
            </View>

            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View>
                <Text style={styles.stepTitle}>Verifica el descuento</Text>
                <Text style={styles.stepText}>El comercio aplicará el descuento a tu compra</Text>
              </View>
            </View>

            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View>
                <Text style={styles.stepTitle}>Listo</Text>
                <Text style={styles.stepText}>Tu beneficio ha sido canjeado</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
            <MaterialCommunityIcons name="share-variant" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  title: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.dark,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...LAYOUT.shadowSmall,
  },
  benefitName: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: SPACING.md,
  },
  benefitSubtitle: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  qrContainer: {
    marginBottom: SPACING.xl,
  },
  qrPlaceholder: {
    width: width - SPACING.lg * 2,
    height: width - SPACING.lg * 2,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.light,
    ...LAYOUT.shadowSmall,
  },
  qrText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
  codeCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.xl,
    ...LAYOUT.shadowSmall,
  },
  codeLabel: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.light,
    borderRadius: LAYOUT.borderRadius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontFamily: 'monospace',
  },
  code: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.dark,
  },
  instructions: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.lg,
    width: '100%',
    ...LAYOUT.shadowSmall,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
  },
  stepText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
  },
});
