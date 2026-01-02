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
          <Text style={styles.sectionTitle}>Alertas Recientes</Text>
          <Text style={styles.sectionText}>No hay alertas pendientes</Text>
        </TouchableOpacity>

        {/* Sección de Reportes */}
        <View style={styles.reportsSection}>
          <Text style={styles.reportsTitle}>📊 Reportes y Estadísticas</Text>
          
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <MaterialCommunityIcons name="chart-line" size={24} color={COLORS.primary} />
              <Text style={styles.reportCardTitle}>Actividad de Usuarios</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Nuevos esta semana:</Text>
              <Text style={styles.reportValue}>24</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Activos hoy:</Text>
              <Text style={styles.reportValue}>156</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Tasa de retención:</Text>
              <Text style={[styles.reportValue, { color: COLORS.success }]}>87%</Text>
            </View>
          </View>

          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <MaterialCommunityIcons name="target" size={24} color={COLORS.warning} />
              <Text style={styles.reportCardTitle}>Misiones Completadas</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Esta semana:</Text>
              <Text style={styles.reportValue}>342</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Pendientes aprobación:</Text>
              <Text style={styles.reportValue}>18</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Tasa de aprobación:</Text>
              <Text style={[styles.reportValue, { color: COLORS.success }]}>94%</Text>
            </View>
          </View>

          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <MaterialCommunityIcons name="gift" size={24} color={COLORS.merchant} />
              <Text style={styles.reportCardTitle}>Beneficios Canjeados</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Total esta semana:</Text>
              <Text style={styles.reportValue}>89</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Puntos gastados:</Text>
              <Text style={styles.reportValue}>4,520 pts</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Beneficio más popular:</Text>
              <Text style={[styles.reportValue, { fontSize: TYPOGRAPHY.caption }]}>Café Gratis</Text>
            </View>
          </View>

          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <MaterialCommunityIcons name="store" size={24} color={COLORS.success} />
              <Text style={styles.reportCardTitle}>Comercios Activos</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Comercios registrados:</Text>
              <Text style={styles.reportValue}>45</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Con canjes esta semana:</Text>
              <Text style={styles.reportValue}>32</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Top comercio:</Text>
              <Text style={[styles.reportValue, { fontSize: TYPOGRAPHY.caption }]}>Café Central</Text>
            </View>
          </View>
        </View>
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
  reportsSection: {
    marginBottom: SPACING.xl,
  },
  reportsTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.lg,
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...LAYOUT.shadowSmall,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reportCardTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.dark,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  reportLabel: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
  reportValue: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.dark,
  },
});
