/**
 * BenefitDetailScreen - Detalles de Beneficio
 * Pantalla que muestra información completa de un beneficio antes de canjearlo
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function BenefitDetailScreen({ route, navigation }) {
  const { benefitId, benefit } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  React.useEffect(() => {
    // Por hacer: obtener datos completos del beneficio
    // para obtener datos completos si no está en route.params
  }, [benefitId]);

  const data = benefit || {
    id: 'benefit_001',
    name: 'Descuento Supermercado',
    provider: 'Supermercado Central',
    description: 'Obtén un descuento del 10% en toda tu compra en cualquier sucursal',
    pointsCost: 150,
    discount: '10%',
    discountType: 'PERCENTAGE',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    stock: 45,
    maxStock: 100,
    terms: [
      'Válido en todas las sucursales',
      'No acumulable con otras promociones',
      'Válido por 30 días desde el canje',
      'Presentar código QR en caja',
    ],
    requirements: [
      'Mínimo 150 puntos disponibles',
      'Usuario verificado',
      'Sin beneficios activos del mismo tipo',
    ],
    redeemCount: 155,
    rating: 4.5,
  };

  const userBalance = 250; // Por hacer: obtener del contexto de autenticación

  const canRedeem = userBalance >= data.pointsCost && data.stock > 0;

  const handleRedeem = () => {
    if (!canRedeem) return;

    Alert.alert(
      'Confirmar Canje',
      `¿Deseas canjear "${data.name}" por ${data.pointsCost} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            try {
              setIsRedeeming(true);
              // Por hacer: procesar canje de beneficio
              // const response = await benefitsAPI.redeem(benefitId);
              
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // navigation.navigate('QRCode', {
              //   benefitId: data.id,
              //   benefitName: data.name,
              //   code: response.data.code,
              // });
              
              alert('Beneficio canjeado exitosamente');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo canjear el beneficio');
            } finally {
              setIsRedeeming(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalles</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Benefit Card */}
        <View style={styles.heroCard}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="gift" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.benefitName}>{data.name}</Text>
          <Text style={styles.provider}>{data.provider}</Text>

          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{data.discount} Descuento</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        {/* Puntos & Disponibilidad */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="star" size={28} color={COLORS.warning} />
            <Text style={styles.infoLabel}>Puntos</Text>
            <Text style={styles.infoValue}>{data.pointsCost}</Text>
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="package" size={28} color={COLORS.info} />
            <Text style={styles.infoLabel}>Disponibles</Text>
            <Text style={styles.infoValue}>{data.stock}</Text>
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="star-circle" size={28} color={COLORS.success} />
            <Text style={styles.infoLabel}>Canjeados</Text>
            <Text style={styles.infoValue}>{data.redeemCount}</Text>
          </View>
        </View>

        {/* Validez */}
        <View style={styles.validitySection}>
          <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.info} />
          <View style={styles.validityInfo}>
            <Text style={styles.validityLabel}>Válido hasta</Text>
            <Text style={styles.validityDate}>
              {data.validUntil.toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>

        {/* Términos y Condiciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
          {data.terms.map((term, idx) => (
            <View key={idx} style={styles.termItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </View>

        {/* Requisitos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requisitos</Text>
          {data.requirements.map((req, idx) => (
            <View key={idx} style={styles.requirementItem}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={COLORS.success}
              />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        {/* Rating */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingStars}>
            {[...Array(5)].map((_, i) => (
              <MaterialCommunityIcons
                key={i}
                name={i < Math.floor(data.rating) ? 'star' : 'star-outline'}
                size={20}
                color={COLORS.warning}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {data.rating} ({data.redeemCount} opiniones)
          </Text>
        </View>

        {/* Espaciado */}
        <View style={{ height: SPACING.lg }} />
      </ScrollView>

      {/* Botón Canjear */}
      <View style={styles.footer}>
        {!canRedeem && (
          <View style={styles.warningBox}>
            {userBalance < data.pointsCost ? (
              <>
                <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.warningText}>
                  Te faltan {data.pointsCost - userBalance} puntos
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.warningText}>Sin stock disponible</Text>
              </>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.redeemButton, !canRedeem && styles.redeemButtonDisabled]}
          onPress={handleRedeem}
          disabled={!canRedeem || isRedeeming}
        >
          {isRedeeming ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="gift" size={20} color={COLORS.white} />
              <Text style={styles.redeemButtonText}>Canjear Ahora</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.dark,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitName: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  provider: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
  discountBadge: {
    backgroundColor: '#fff3cd',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  discountText: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.warning,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginTop: SPACING.sm,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: SPACING.xs,
  },
  validitySection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    ...LAYOUT.shadowSmall,
  },
  validityInfo: {
    flex: 1,
  },
  validityLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
  validityDate: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: SPACING.xs,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  termText: {
    flex: 1,
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    lineHeight: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  requirementText: {
    flex: 1,
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    lineHeight: 20,
  },
  ratingSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    ...LAYOUT.shadowSmall,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginLeft: SPACING.md,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#ffebee',
    padding: SPACING.md,
    borderRadius: LAYOUT.borderRadius.md,
  },
  warningText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.danger,
  },
  redeemButton: {
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  redeemButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
  },
});
