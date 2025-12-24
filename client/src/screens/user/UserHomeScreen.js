import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/theme';
import { walletAPI, benefitsAPI, pointsAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function UserHomeScreen({ navigation }) {
  const { authState, logout } = useContext(AuthContext);

  const [userData, setUserData] = useState({ name: 'Usuario', email: '' });
  const [balance, setBalance] = useState(0);
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [monthlyGoal] = useState(500);
  const [activities, setActivities] = useState([]);
  const [earnOptions, setEarnOptions] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Solo cargar datos si el usuario está autenticado
    if (authState.authenticated && authState.token) {
      loadData();
    } else {
      setUserData({ name: 'Usuario no autenticado', email: '' });
      setError('Por favor inicia sesión para ver tus datos');
    }
  }, [authState.authenticated, authState.token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!authState.authenticated || !authState.token) {
        setError('No autenticado. Por favor inicia sesión.');
        return;
      }

      const [userRes, benefitsRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        benefitsAPI.getAll(),
        pointsAPI.getTransactions(), // Cargar historial de transacciones
      ]);

      // Extraer datos del usuario
      const user = userRes.data?.data;
      
      if (user) {
        setUserData({
          name: user.name || 'Usuario',
          email: user.email || '',
        });
        setBalance(user.wallet?.balance || 0);
      } else {
        setUserData({ name: 'Usuario', email: '' });
      }

      // Extraer y procesar transacciones (para activities)
      const transactionsList = (transactionsRes.data?.data || []);
      const formattedActivities = transactionsList.map(t => {
        const iconMap = {
          EARN: 'plus-circle',
          REDEEM: 'minus-circle',
          TRANSFER: 'transfer',
        };
        const colorMap = {
          EARN: '#4CAF50',
          REDEEM: '#f44336',
          TRANSFER: '#2196F3',
        };

        return {
          id: t.id,
          title: t.description || 'Transacción',
          description: t.description || '',
          points: `${t.type === 'EARN' ? '+' : '-'}${t.amount}`,
          color: colorMap[t.type] || '#9C27B0',
          icon: iconMap[t.type] || 'history',
          time: new Date(t.createdAt).toLocaleDateString('es-ES').toUpperCase(),
        };
      });
      setActivities(formattedActivities);
      
      // Calcular puntos mensuales
      const monthlyEarned = formattedActivities
        .filter(a => a.points.startsWith('+'))
        .reduce((sum, a) => sum + parseInt(a.points.substring(1)), 0);
      setMonthlyPoints(monthlyEarned);

      // Extraer beneficios
      const beneficisList = (benefitsRes.data?.data || []).map(b => ({
        id: b.id,
        name: b.title,
        description: b.description,
        pointsCost: b.pointsCost,
        stock: b.stock,
        redeemable: b.stock > 0,
      }));
      setBenefits(beneficisList);

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('[UserHomeScreen] Error al cargar datos:', err.response?.status, err.message);
      
      // Si es 401, el token es inválido
      if (err.response?.status === 401) {
        console.warn('[UserHomeScreen] Token inválido, desconectando usuario');
        await logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRedeemBenefit = async (benefitId, points) => {
    if (balance < points) {
      Alert.alert('Puntos Insuficientes', `Necesitas ${points} puntos para este beneficio`);
      return;
    }

    try {
      await pointsAPI.redeemBenefit(benefitId);
      Alert.alert('Éxito', 'Beneficio canjeado correctamente');
      await loadData();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Alert.alert('Error', errorMessage);
    }
  };


  if (loading) {
    return (
      <ScreenWrapper bgColor={COLORS.white}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <ScreenWrapper bgColor={COLORS.white} padding={0} maxWidth={false} safeArea={false}>
      {/* HEADER FIJO EN WEB */}
      {Platform.OS === 'web' && (
        <View style={styles.fixedHeader}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Tus Estadísticas</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.pointsBadge}>
                <MaterialCommunityIcons name="star" size={16} color="#FFB84D" />
                <Text style={styles.pointsText}>{balance.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>PUNTOS</Text>
              </View>
              <View style={styles.userProfile}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(userData.name)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <Text style={styles.userEmail}>{userData.email}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* EN MÓVIL, SIN HEADER (React Navigation lo maneja) */}

        {/* SALUDO */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Hola, {userData.name} 👋</Text>
        </View>

        {/* CONTENEDOR PRINCIPAL (BALANCE + STATS) */}
        <View style={styles.mainContent}>
          {/* TARJETA DE BALANCE */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <View>
                <Text style={styles.balanceLabel}>BALANCE DISPONIBLE</Text>
                <Text style={styles.balanceAmount}>{balance.toLocaleString()}</Text>
                <Text style={styles.balanceUnit}>Puntos</Text>
              </View>
              <MaterialCommunityIcons name="wallet" size={80} color="#E8F5E9" />
            </View>
            <View style={styles.balanceActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.primaryBtn]}
                onPress={() => navigation.navigate('Earn')}
              >
                <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Canjear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PANEL DERECHO (STATS + ACTIVIDAD) */}
          <View style={styles.sidePanel}>
            {/* PUNTOS ESTE MES */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>PUNTOS ESTE MES</Text>
                <MaterialCommunityIcons name="trending-up" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.statNumber}>+{monthlyPoints}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(monthlyPoints / monthlyGoal) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Progreso <Text style={styles.progressHighlight}>Meta: {monthlyGoal}</Text>
              </Text>
            </View>

            {/* ACTIVIDAD RECIENTE */}
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>Actividad Reciente</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllLink}>VER TODO</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.activitiesList}>
                {activities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                      <MaterialCommunityIcons
                        name={activity.icon}
                        size={18}
                        color={activity.color}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityItemTitle}>{activity.title}</Text>
                      <Text style={styles.activityDesc}>{activity.description}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                    <Text style={[styles.activityPoints, { color: activity.color }]}>
                      {activity.points}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* SECCIÓN GANA MÁS PUNTOS HOY */}
        <View style={styles.earnSection}>
          <View style={styles.earnHeader}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={COLORS.primary} />
            <Text style={styles.earnTitle}>Gana Más Puntos Hoy</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.earnScroll}
          >
            {earnOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.earnCard}
                onPress={() => navigation.navigate('Earn')}
              >
                <View style={styles.earnIconContainer}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={32}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.earnCardTitle}>{option.title}</Text>
                <Text style={styles.earnCardDesc}>{option.description}</Text>
                <View style={styles.earnCardFooter}>
                  <Text style={styles.earnCardPoints}>{option.points}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BENEFICIOS DISPONIBLES */}
        {benefits.length > 0 && (
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Beneficios Disponibles</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.benefitsScroll}
            >
              {benefits.map((benefit) => (
                <TouchableOpacity
                  key={benefit.id}
                  style={styles.benefitCard}
                  onPress={() => {
                    if (benefit.redeemable) {
                      handleRedeemBenefit(benefit.id, benefit.pointsCost);
                    }
                  }}
                  disabled={!benefit.redeemable}
                >
                  <View style={styles.benefitIcon}>
                    <MaterialCommunityIcons name="gift" size={24} color={COLORS.primary} />
                  </View>
                  <Text style={styles.benefitName}>{benefit.name}</Text>
                  <Text style={styles.benefitDesc}>{benefit.description}</Text>
                  <View style={styles.benefitFooter}>
                    <Text style={styles.benefitCost}>{benefit.pointsCost} pts</Text>
                    {benefit.redeemable && (
                      <TouchableOpacity
                        style={styles.redeemBtn}
                        onPress={() => handleRedeemBenefit(benefit.id, benefit.pointsCost)}
                      >
                        <Text style={styles.redeemBtnText}>Canjear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingTop: SPACING.md,
    paddingRight: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'web' ? 90 : SPACING.md,
    paddingBottom: SPACING.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray,
    fontSize: TYPOGRAPHY.body2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Platform.OS === 'web' ? SPACING.lg : SPACING.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.dark,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: SPACING.md,
    flexDirection: 'row',
  },
  pointsBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#FFB84D',
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFB84D',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontWeight: '600',
    fontSize: 12,
    color: COLORS.dark,
  },
  userEmail: {
    fontSize: 10,
    color: COLORS.gray,
  },
  greeting: {
    marginBottom: Platform.OS === 'web' ? SPACING.lg : SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'web' ? SPACING.md : 0,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: Platform.OS === 'web' ? SPACING.sm : 0,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  mainContent: {
    marginBottom: Platform.OS === 'web' ? SPACING.xl : SPACING.md,
    gap: SPACING.md,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flex: Platform.OS === 'web' ? 1 : undefined,
    paddingHorizontal: SPACING.md,
    alignItems: Platform.OS === 'web' ? 'flex-start' : undefined,
  },
  balanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light,
    padding: SPACING.lg,
    marginBottom: Platform.OS === 'web' ? 0 : SPACING.lg,
    flex: Platform.OS === 'web' ? 1.5 : undefined,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: Platform.OS === 'web' ? 4 : 0,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.dark,
    lineHeight: Platform.OS === 'web' ? 50 : undefined,
  },
  balanceUnit: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: Platform.OS === 'web' ? 4 : 0,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.success,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  sidePanel: {
    gap: SPACING.lg,
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light,
    padding: SPACING.lg,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: Platform.OS === 'web' ? SPACING.md : 0,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: Platform.OS === 'web' ? SPACING.md : 0,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  progressHighlight: {
    fontWeight: '700',
    color: COLORS.dark,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light,
    padding: SPACING.lg,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activitiesList: {
    gap: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },
  activityDesc: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: Platform.OS === 'web' ? 2 : 0,
  },
  activityTime: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: Platform.OS === 'web' ? 2 : 0,
    fontWeight: '500',
  },
  activityPoints: {
    fontWeight: '700',
    fontSize: 12,
  },
  earnSection: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  earnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  earnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
  earnScroll: {
    paddingRight: SPACING.md,
    gap: SPACING.md,
  },
  earnCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light,
    padding: SPACING.md,
    alignItems: 'center',
  },
  earnIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  earnCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  earnCardDesc: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 14,
  },
  earnCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earnCardPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  benefitsSection: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.lg,
  },
  benefitsScroll: {
    paddingRight: SPACING.md,
    gap: SPACING.md,
  },
  benefitCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light,
    padding: SPACING.md,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  benefitDesc: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: SPACING.md,
    lineHeight: 13,
  },
  benefitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  benefitCost: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  redeemBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  redeemBtnText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '600',
  },
  logoutSection: {
    marginVertical: SPACING.xl,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.body1,
  },
});
