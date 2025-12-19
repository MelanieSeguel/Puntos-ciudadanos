/**
 * EarnScreen - Pantalla para Ganar Puntos
 * Muestra formas de ganar puntos
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function EarnScreen() {
  const ways = [
    { id: '1', icon: 'shopping', title: 'Comprar', description: 'Gana puntos por cada compra', points: '1 pt = $1' },
    { id: '2', icon: 'account-plus', title: 'Referir', description: 'Invita amigos y gana', points: '+50 pts' },
    { id: '3', icon: 'star', title: 'Reseña', description: 'Deja una reseña y gana', points: '+25 pts' },
    { id: '4', icon: 'gift', title: 'Promociones', description: 'Aprovecha ofertas especiales', points: '2x pts' },
  ];

  const renderWay = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <MaterialCommunityIcons name={item.icon} size={32} color={COLORS.primary} style={styles.icon} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{item.points}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bgColor={COLORS.light}>
      <View style={styles.header}>
        <Text style={styles.title}>Formas de Ganar Puntos</Text>
        <Text style={styles.subtitle}>Acumula puntos fácilmente</Text>
      </View>

      <FlatList
        data={ways}
        renderItem={renderWay}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={styles.list}
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
});
