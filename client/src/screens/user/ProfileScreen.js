/**
 * ProfileScreen - Pantalla de Perfil de Usuario
 * Muestra información del perfil y opciones
 */

import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';
import { walletAPI, pointsAPI } from '../../services/api';

export default function ProfileScreen({ navigation }) {
  const { authState, logout } = useContext(AuthContext);
  const { user } = authState;
  
  const [stats, setStats] = useState({
    totalPoints: 0,
    monthlyPoints: 0,
    benefitsRedeemed: 0,
    missionsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Obtener balance actual
      const balanceRes = await walletAPI.getBalance();
      const balance = balanceRes.data?.data?.wallet?.balance || 0;
      
      // Obtener transacciones
      const transactionsRes = await pointsAPI.getTransactions(100, 0);
      const transactions = transactionsRes.data?.data || [];
      
      // Calcular estadísticas
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthlyEarned = transactions
        .filter(t => t.type === 'EARNED' && new Date(t.createdAt) >= monthStart)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const benefitsCount = transactions.filter(t => t.type === 'SPENT').length;
      
      const missionsCount = transactions.filter(t => 
        t.type === 'EARNED' && t.description?.includes('Misión aprobada')
      ).length;
      
      setStats({
        totalPoints: balance,
        monthlyPoints: monthlyEarned,
        benefitsRedeemed: benefitsCount,
        missionsCompleted: missionsCount,
      });
    } catch (error) {
      console.error('[ProfileScreen] Error cargando stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Salir',
          onPress: async () => {
            try {
              await logout();
              // La navegación se maneja automáticamente en AuthContext
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión correctamente');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'web' ? 90 : SPACING.md }]}>
        {/* Header del Perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={48} color={COLORS.white} />
          </View>
          <Text style={styles.nameText}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'USER' ? '👤 Ciudadano' : 
               user?.role === 'MERCHANT' ? '🏪 Comerciante' :
               user?.role === 'ADMIN' ? '⚙️ Administrador' : 'Usuario'}
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="wallet" size={32} color={COLORS.success} />
              <Text style={styles.statValue}>{stats.totalPoints.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Puntos Actuales</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="chart-line" size={32} color={COLORS.primary} />
              <Text style={styles.statValue}>+{stats.monthlyPoints}</Text>
              <Text style={styles.statLabel}>Este Mes</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="trophy" size={32} color={COLORS.warning} />
              <Text style={styles.statValue}>{stats.missionsCompleted}</Text>
              <Text style={styles.statLabel}>Misiones</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="gift" size={32} color={COLORS.error} />
              <Text style={styles.statValue}>{stats.benefitsRedeemed}</Text>
              <Text style={styles.statLabel}>Canjeados</Text>
            </View>
          </View>
        )}

        {/* Opciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <MaterialCommunityIcons name="bell" size={24} color={COLORS.primary} style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Notificaciones</Text>
              <Text style={styles.optionSubtext}>Configura tus preferencias</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
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
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Puntos Ciudadanos v1.0.0</Text>
          <Text style={styles.footerSubtext}>Hecho con ❤️ para nuestra comunidad</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
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
    ...LAYOUT.shadowSmall,
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
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  roleText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  statValue: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: SPACING.sm,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...LAYOUT.shadowSmall,
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
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
