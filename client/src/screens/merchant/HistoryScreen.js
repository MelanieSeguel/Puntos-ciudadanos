/**
 * HistoryScreen - Historial de validaciones para Comercios
 * Muestra el registro de cupones validados
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function HistoryScreen() {
  const [transactions] = React.useState([
    {
      id: '1',
      client: 'Juan Pérez',
      product: 'Pizza 2x1',
      points: 100,
      time: '10:30 AM',
      date: 'Hoy',
    },
    {
      id: '2',
      client: 'María González',
      product: 'Descuento 20%',
      points: 50,
      time: '09:15 AM',
      date: 'Hoy',
    },
    {
      id: '3',
      client: 'Carlos López',
      product: 'Hamburguesa Gratis',
      points: 120,
      time: '08:45 AM',
      date: 'Hoy',
    },
    {
      id: '4',
      client: 'Ana Martínez',
      product: 'Bebida Gratis',
      points: 75,
      time: '15:20 PM',
      date: 'Ayer',
    },
    {
      id: '5',
      client: 'Roberto Silva',
      product: 'Postre Gratis',
      points: 85,
      time: '14:10 PM',
      date: 'Ayer',
    },
  ]);

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionCard}>
      <MaterialCommunityIcons name="check-circle" size={32} color={COLORS.success} style={styles.transactionIcon} />
      <View style={styles.transactionLeft}>
        <Text style={styles.clientName}>{item.client}</Text>
        <Text style={styles.productName}>{item.product}</Text>
        <Text style={styles.dateText}>
          {item.date} • {item.time}
        </Text>
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>+{item.points}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateSeparator = (date) => (
    <View key={date} style={styles.dateSeparator}>
      <Text style={styles.dateLabel}>{date}</Text>
    </View>
  );

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Canjes</Text>
        <Text style={styles.subtitle}>Registro de transacciones</Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {transactions.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-list" size={48} color={COLORS.gray} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>Sin transacciones aún</Text>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.lg,
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
  listContainer: {
    paddingBottom: SPACING.xl,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  transactionIcon: {
    marginRight: SPACING.md,
  },
  transactionLeft: {
    flex: 1,
  },
  clientName: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    opacity: 0.7,
  },
  pointsBadge: {
    backgroundColor: COLORS.merchant,
    borderRadius: LAYOUT.borderRadius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.white,
  },
  dateSeparator: {
    paddingVertical: SPACING.md,
  },
  dateLabel: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.light,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
});
