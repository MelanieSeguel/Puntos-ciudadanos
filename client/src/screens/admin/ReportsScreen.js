/**
 * ReportsScreen - Reportes y análisis
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function ReportsScreen() {
  const reports = [
    { id: '1', title: 'Reporte de Usuarios', icon: 'chart-box', color: COLORS.user },
    { id: '2', title: 'Reporte de Comercios', icon: 'chart-line', color: COLORS.merchant },
    { id: '3', title: 'Análisis de Puntos', icon: 'chart-box-plus-outline', color: COLORS.warning },
    { id: '4', title: 'Transacciones Diarias', icon: 'trending-down', color: COLORS.error },
  ];

  return (
    <ScreenWrapper bgColor={COLORS.light}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Reportes</Text>
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
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: TYPOGRAPHY.h3, fontWeight: '700', color: COLORS.dark, marginBottom: SPACING.lg },
  reportsList: { gap: SPACING.md, marginBottom: SPACING.xl },
  reportCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    ...LAYOUT.shadowSmall,
  },
  reportIcon: { marginRight: SPACING.md },
  reportContent: { flex: 1 },
  reportTitle: { fontSize: TYPOGRAPHY.body1, fontWeight: '600', color: COLORS.dark, marginBottom: SPACING.xs },
  reportDate: { fontSize: TYPOGRAPHY.caption, color: COLORS.gray },
});
