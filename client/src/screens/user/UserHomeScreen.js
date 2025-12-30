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
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/theme';
import { walletAPI, benefitsAPI, pointsAPI, missionsAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function UserHomeScreen({ navigation: navigationProp }) {
  // En web se pasa como prop, en móvil usar el hook
  const hookNavigation = useNavigation();
  const navigation = Platform.OS === 'web' && navigationProp ? navigationProp : hookNavigation;
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
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    // Solo cargar datos si el usuario está autenticado
    if (authState.authenticated && authState.token) {
      loadData();
    } else {
      setUserData({ name: 'Usuario no autenticado', email: '' });
      setError('Por favor inicia sesión para ver tus datos');
    }
  }, [authState.authenticated, authState.token]);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    if (!authState.authenticated || !authState.token) return;

    const interval = setInterval(() => {
      loadData();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [authState.authenticated, authState.token]);

  const loadData = async () => {
    // Prevenir múltiples cargas simultáneas
    if (isLoadingData) {
      console.log('[UserHomeScreen] Ya hay una carga en progreso, omitiendo...');
      return;
    }

    try {
      setIsLoadingData(true);
      setLoading(true);
      setError(null);

      // Verificar autenticación
      if (!authState.authenticated || !authState.token) {
        setError('No autenticado. Por favor inicia sesión.');
        return;
      }

      const [userRes, benefitsRes, transactionsRes, missionsRes] = await Promise.all([
        walletAPI.getBalance(),
        benefitsAPI.getAll(),
        pointsAPI.getTransactions(5, 0),
        missionsAPI.getAvailable(),
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

      // Extraer y procesar transacciones
      const transactionsList = (transactionsRes.data?.data || []);
      const formattedActivities = transactionsList.slice(0, 3).map(t => {
        // Detectar si es una misión aprobada
        const isMissionApproved = t.type === 'EARNED' && t.description?.includes('Misión aprobada');
        
        const iconMap = {
          EARNED: isMissionApproved ? 'trophy' : 'plus-circle',
          SPENT: 'gift',
          TRANSFER: 'swap-horizontal',
        };
        const colorMap = {
          EARNED: isMissionApproved ? '#FF9800' : '#4CAF50',
          SPENT: '#FF9800',
          TRANSFER: '#2196F3',
        };

        const date = new Date(t.createdAt);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        let timeString;
        if (isToday) {
          timeString = `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (isYesterday) {
          timeString = `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          timeString = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        }

        // Usar la descripción real de la transacción
        let subtitle;
        if (t.type === 'EARNED') {
          subtitle = isMissionApproved ? 'Misión completada' : 'Puntos ganados';
        } else if (t.type === 'SPENT') {
          subtitle = 'Beneficio canjeado';
        } else {
          subtitle = 'Transferencia';
        }

        return {
          id: t.id,
          title: t.description || 'Transacción',
          description: subtitle,
          points: `${t.type === 'EARNED' ? '+' : '-'}${t.amount}`,
          color: colorMap[t.type] || '#9C27B0',
          icon: iconMap[t.type] || 'history',
          time: timeString,
        };
      });
      setActivities(formattedActivities);
      
      // Calcular puntos mensuales
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyTransactions = transactionsList.filter(t => {
        const tDate = new Date(t.createdAt);
        return tDate >= monthStart && t.type === 'EARNED';
      });
      const monthlyEarned = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
      setMonthlyPoints(monthlyEarned);

      // Extraer beneficios
      const beneficisList = (benefitsRes.data?.data || []).slice(0, 4).map(b => ({
        id: b.id,
        name: b.title,
        description: b.description,
        pointsCost: b.pointsCost,
        stock: b.stock,
        redeemable: b.stock > 0,
      }));
      setBenefits(beneficisList);

      // Extraer misiones disponibles
      const missionsList = (missionsRes.data?.missions || missionsRes.data?.data || []).slice(0, 4).map(m => ({
        id: m.id,
        title: m.title || m.name,
        description: m.description?.substring(0, 40) + '...' || 'Completa esta misión',
        points: `+${m.points}`,
        icon: m.icon || 'star',
      }));
      setEarnOptions(missionsList);

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
      setIsLoadingData(false);
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

  return (
    <ScreenWrapper bgColor={COLORS.light} padding={0} maxWidth={Platform.OS === 'web'} safeArea={Platform.OS !== 'web'}>
      <ScrollView
        style={styles.scrollView}
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
          {/* COLUMNA IZQUIERDA: BALANCE + GANA PUNTOS */}
          <View style={styles.leftColumn}>
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
                  onPress={() => navigation.navigate('Benefits')}
                >
                  <MaterialCommunityIcons name="gift" size={18} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Canjear</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECCIÓN GANA MÁS PUNTOS HOY */}
            {earnOptions.length > 0 && (
              <View style={styles.earnSectionInline}>
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
            )}
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
                <TouchableOpacity onPress={() => navigation.navigate('Historial')}>
                  <Text style={styles.seeAllLink}>VER TODO</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.activitiesList}>
                {activities.length === 0 ? (
                  <Text style={styles.emptyText}>No hay actividad reciente</Text>
                ) : (
                  activities.map((activity) => (
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
                  ))
                )}
              </View>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Platform.OS === 'web' ? SPACING.xl : SPACING.md,
    paddingTop: Platform.OS === 'web' ? 90 : SPACING.md,
    paddingBottom: SPACING.xl,
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
  emptyText: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  greeting: {
    marginBottom: SPACING.lg,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: SPACING.md,
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
    marginBottom: SPACING.xl,
    gap: SPACING.md,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'stretch',
  },
  leftColumn: {
    flex: Platform.OS === 'web' ? 1.5 : 1,
    gap: SPACING.md,
  },
  balanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light,
    padding: SPACING.lg,
    marginBottom: Platform.OS === 'web' ? 0 : SPACING.md,
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
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.dark,
    lineHeight: 52,
  },
  balanceUnit: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
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
    gap: SPACING.md,
    flex: Platform.OS === 'web' ? 1 : 1,
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
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: SPACING.sm,
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
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
  },
  activityPoints: {
    fontWeight: '700',
    fontSize: 12,
  },
  earnSection: {
    marginBottom: SPACING.xl,
  },
  earnSectionInline: {
    marginTop: 0,
    width: '100%',
  },
  earnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.md,
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
