/**
 * EarnScreen - Pantalla para Ganar Puntos
 * Muestra formas de ganar puntos
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function EarnScreen() {
  const [missions, setMissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Por hacer: conectar a GET /api/v1/missions
  // useEffect(() => {
  //   missionsAPI.getAvailable().then(res => {
  //     setMissions(res.data.data);
  //     setLoading(false);
  //   });
  // }, []);

  const renderMission = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <MaterialCommunityIcons name="target" size={32} color={COLORS.primary} style={styles.icon} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name || item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>+{item.points} pts</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Formas de Ganar Puntos</Text>
        <Text style={styles.subtitle}>Acumula puntos fácilmente</Text>
      </View>

      <FlatList
        data={missions}
        renderItem={renderMission}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Cargando misiones...</Text>}
      />

      <View style={styles.info}>
        <Text style={styles.infoTitle}>💡 Consejo</Text>
        <Text style={styles.infoText}>
          Cuantos más puntos tengas, más beneficios podrás disfrutar.
        </Text>
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
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  icon: {
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
  pointsBadge: {
    backgroundColor: COLORS.success,
    borderRadius: LAYOUT.borderRadius.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  pointsText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body1,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  info: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    lineHeight: 20,
  },
  listContent: {
    paddingTop: Platform.OS === 'web' ? 0 : SPACING.md,
  },
});
