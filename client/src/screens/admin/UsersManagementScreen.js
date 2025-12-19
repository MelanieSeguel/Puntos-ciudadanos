/**
 * UsersManagementScreen - Gestión de usuarios
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function UsersManagementScreen() {
  const users = [
    { id: '1', name: 'Juan Pérez', email: 'juan@test.com', status: 'Activo' },
    { id: '2', name: 'María González', email: 'maria@test.com', status: 'Activo' },
    { id: '3', name: 'Carlos López', email: 'carlos@test.com', status: 'Inactivo' },
  ];

  return (
    <ScreenWrapper bgColor={COLORS.light}>
      <Text style={styles.title}>Gestión de Usuarios</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Activo' ? COLORS.success : COLORS.warning }]}>
              <Text style={styles.statusText}>{item.status}</Text>
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
  userCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: TYPOGRAPHY.body1, fontWeight: '600', color: COLORS.dark, marginBottom: SPACING.xs },
  userEmail: { fontSize: TYPOGRAPHY.caption, color: COLORS.gray },
  statusBadge: { borderRadius: LAYOUT.borderRadius.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  statusText: { fontSize: TYPOGRAPHY.caption, fontWeight: '600', color: COLORS.white },
});
