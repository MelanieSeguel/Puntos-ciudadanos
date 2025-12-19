/**
 * ProfileScreen - Pantalla de Perfil de Usuario
 * Muestra información del perfil y opciones
 */

import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function ProfileScreen() {
  const { authState, logout } = useContext(AuthContext);
  const { user } = authState;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScreenWrapper bgColor={COLORS.light}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header del Perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={48} color={COLORS.white} />
          </View>
          <Text style={styles.nameText}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star" size={32} color={COLORS.warning} />
            <Text style={styles.statValue}>1,250</Text>
            <Text style={styles.statLabel}>Puntos</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="gift" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Beneficios</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar" size={32} color={COLORS.success} />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Meses</Text>
          </View>
        </View>

        {/* Opciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <MaterialCommunityIcons name="bell" size={24} color={COLORS.primary} style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Notificaciones</Text>
              <Text style={styles.optionSubtext}>Configura tus preferencias</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <MaterialCommunityIcons name="lock" size={24} color={COLORS.primary} style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Seguridad</Text>
              <Text style={styles.optionSubtext}>Cambiar contraseña</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <MaterialCommunityIcons name="help-circle" size={24} color={COLORS.primary} style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Ayuda y Soporte</Text>
              <Text style={styles.optionSubtext}>Contacta con nosotros</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {/* Botón de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>v1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.user,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nameText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  emailText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  statValue: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: '700',
    color: COLORS.user,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  optionItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  optionIcon: {
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
  },
  optionSubtext: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
});
