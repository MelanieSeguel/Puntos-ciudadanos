/**
 * BenefitsScreen - Pantalla de Beneficios para Usuarios
 * Muestra beneficios disponibles y canjeados
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function BenefitsScreen() {
  const benefits = [
    { id: '1', name: 'Descuento 20%', description: 'En todas las tiendas', cost: 100 },
    { id: '2', name: 'Café Gratis', description: 'Una taza de café', cost: 50 },
    { id: '3', name: 'Pizza 2x1', description: 'En pizzería local', cost: 150 },
  ];

  const renderBenefit = ({ item }) => (
    <TouchableOpacity style={styles.benefitCard}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="gift" size={32} color={COLORS.primary} />
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitName}>{item.name}</Text>
        <Text style={styles.benefitDescription}>{item.description}</Text>
      </View>
      <View style={styles.costBadge}>
        <Text style={styles.costText}>{item.cost}</Text>
        <Text style={styles.costLabel}>pts</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Beneficios Disponibles</Text>
        <Text style={styles.subtitle}>Canjea tus puntos por premios</Text>
      </View>

      <FlatList
        data={benefits}
        renderItem={renderBenefit}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        style={styles.list}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Más beneficios próximamente</Text>
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
  list: {
    marginBottom: SPACING.xl,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...LAYOUT.shadowSmall,
  },
  benefitContent: {
    flex: 1,
  },
  benefitName: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  benefitDescription: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
  costBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    minWidth: 60,
  },
  costText: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: '700',
    color: COLORS.white,
  },
  costLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.8,
  },
  footer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
  listContent: {
    paddingTop: Platform.OS === 'web' ? 0 : SPACING.md,
  },
});
