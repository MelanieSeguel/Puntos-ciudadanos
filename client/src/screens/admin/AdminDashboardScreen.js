/**
 * AdminDashboardScreen - Panel de control administrativo
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function AdminDashboardScreen() {
  const stats = [
    { icon: 'account-multiple', label: 'Usuarios Activos', value: '1,234', color: COLORS.user },
    { icon: 'store', label: 'Comercios', value: '45', color: COLORS.merchant },
    { icon: 'star', label: 'Puntos en Circulación', value: '50K', color: COLORS.warning },
    { icon: 'cash-multiple', label: 'Transacciones', value: '892', color: COLORS.success },
  ];

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Panel de Control</Text>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <MaterialCommunityIcons
                name={stat.icon}
                size={32}
                color={stat.color}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Alertas Recientes</Text>
          <Text style={styles.sectionText}>No hay alertas pendientes</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: TYPOGRAPHY.h3, fontWeight: '700', color: COLORS.dark, marginBottom: SPACING.xl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  statIcon: { marginBottom: SPACING.sm },
  statValue: { fontSize: TYPOGRAPHY.h5, fontWeight: '700', color: COLORS.dark, marginBottom: SPACING.xs },
  statLabel: { fontSize: TYPOGRAPHY.caption, color: COLORS.gray, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionTitle: { fontSize: TYPOGRAPHY.body1, fontWeight: '600', color: COLORS.dark, marginBottom: SPACING.sm },
  sectionText: { fontSize: TYPOGRAPHY.body2, color: COLORS.gray },
  scrollContent: {
    paddingTop: Platform.OS === 'web' ? 0 : SPACING.md,
  },
});
