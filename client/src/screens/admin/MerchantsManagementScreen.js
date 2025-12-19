/**
 * MerchantsManagementScreen - Gestión de comercios
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function MerchantsManagementScreen() {
  const merchants = [
    { id: '1', name: 'Pizzería Central', city: 'CABA', transactions: 145 },
    { id: '2', name: 'Café del Barrio', city: 'Flores', transactions: 89 },
    { id: '3', name: 'Restaurante Premium', city: 'San Isidro', transactions: 234 },
  ];

  return (
    <ScreenWrapper bgColor={COLORS.light}>
      <Text style={styles.title}>Gestión de Comercios</Text>
      <FlatList
        data={merchants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.merchantCard}>
            <View style={styles.merchantInfo}>
              <Text style={styles.merchantName}>{item.name}</Text>
              <Text style={styles.merchantCity}>{item.city}</Text>
            </View>
            <View style={styles.transactionBadge}>
              <Text style={styles.transactionText}>{item.transactions}</Text>
              <Text style={styles.transactionLabel}>txs</Text>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: TYPOGRAPHY.h3, fontWeight: '700', color: COLORS.dark, marginBottom: SPACING.lg },
  merchantCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  merchantInfo: { flex: 1 },
  merchantName: { fontSize: TYPOGRAPHY.body1, fontWeight: '600', color: COLORS.dark, marginBottom: SPACING.xs },
  merchantCity: { fontSize: TYPOGRAPHY.caption, color: COLORS.gray },
  transactionBadge: { backgroundColor: COLORS.merchant, borderRadius: LAYOUT.borderRadius.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center' },
  transactionText: { fontSize: TYPOGRAPHY.body1, fontWeight: '700', color: COLORS.white },
  transactionLabel: { fontSize: TYPOGRAPHY.caption, color: COLORS.white, opacity: 0.8 },
});
