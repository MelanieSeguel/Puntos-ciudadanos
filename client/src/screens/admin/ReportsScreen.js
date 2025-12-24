/**
 * ReportsScreen - Reportes y análisis
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40; // Restamos padding laterales (20 + 20)

export default function ReportsScreen() {
  const reports = [
    { id: '1', title: 'Reporte de Usuarios', icon: 'chart-box', color: COLORS.user },
    { id: '2', title: 'Reporte de Comercios', icon: 'chart-line', color: COLORS.merchant },
    { id: '3', title: 'Análisis de Puntos', icon: 'chart-box-plus-outline', color: COLORS.warning },
    { id: '4', title: 'Transacciones Diarias', icon: 'trending-down', color: COLORS.error },
  ];

  const statsData = [
    { label: 'Usuarios Activos', value: '1,245', trend: '+12%', color: COLORS.user },
    { label: 'Puntos Distribuidos', value: '45,890', trend: '+8%', color: COLORS.primary },
    { label: 'Canjes Realizados', value: '312', trend: '-3%', color: COLORS.merchant },
    { label: 'Comercios Asociados', value: '45', trend: '+5%', color: COLORS.warning },
  ];

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent]}
      >
        <Text style={styles.title}>Reportes e Impacto</Text>

        {/* Tarjetas de Estadísticas */}
        <View style={styles.statsGrid}>
          {statsData.map((stat, idx) => (
            <View key={idx} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={[styles.statTrend, { color: stat.trend.startsWith('+') ? COLORS.success : COLORS.error }]}>
                {stat.trend}
              </Text>
            </View>
          ))}
        </View>

        {/* Sección de Reportes */}
        <Text style={styles.sectionTitle}>Reportes Disponibles</Text>
        <View style={styles.reportsList}>
          {reports.map((report) => (
            <TouchableOpacity key={report.id} style={[styles.reportCard, { borderLeftColor: report.color }]}>
              <MaterialCommunityIcons
                name={report.icon}
                size={32}
                color={report.color}
                style={styles.reportIcon}
              />
              <View style={styles.reportContent}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDate}>Última actualización: Hoy</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info General */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>Los reportes se actualizan cada 24 horas. Último sync: Hoy a las 14:32</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  title: { 
    fontSize: TYPOGRAPHY.h2, 
    fontWeight: '700', 
    color: COLORS.dark, 
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  
  // Tarjetas de Estadísticas
  statsGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    ...LAYOUT.shadowSmall,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  statTrend: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
  },

  // Reportes
  reportsList: { 
    gap: SPACING.md, 
    marginBottom: SPACING.xl,
  },
  reportCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    ...LAYOUT.shadowSmall,
  },
  reportIcon: { 
    marginRight: SPACING.md 
  },
  reportContent: { 
    flex: 1 
  },
  reportTitle: { 
    fontSize: TYPOGRAPHY.body1, 
    fontWeight: '600', 
    color: COLORS.dark, 
    marginBottom: SPACING.xs 
  },
  reportDate: { 
    fontSize: TYPOGRAPHY.caption, 
    color: COLORS.gray 
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.dark,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'web' ? 0 : SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
