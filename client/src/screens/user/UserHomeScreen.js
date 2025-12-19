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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/theme';
import { walletAPI, benefitsAPI, pointsAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { AuthContext } from '../../context/AuthContext';

export default function UserHomeScreen({ navigation }) {
  const { authState, logout } = useContext(AuthContext);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos desde backend
      const [userRes, benefitsRes] = await Promise.all([
        walletAPI.getBalance(),  // GET /auth/me - devuelve user con wallet.saldoActual
        benefitsAPI.getAll(),    // GET /benefits
      ]);

      // Extraer saldo del usuario
      const userBalance = userRes.data?.data?.wallet?.saldoActual || 0;
      setBalance(userBalance);

      // Mostrar transacciones vacías ya que no hay endpoint en backend
      setTransactions([
        { 
          id: 'info', 
          description: 'Historial de transacciones no disponible aún',
          amount: 0,
          date: new Date().toISOString().split('T')[0]
        }
      ]);

      // Extraer beneficios
      const beneficisList = (benefitsRes.data?.data || []).map(b => ({
        id: b.id,
        name: b.titulo,
        description: b.descripcion,
        pointsCost: b.costoPuntos,
        stock: b.stock,
        redeemable: b.stock > 0,
      }));
      setBenefits(beneficisList);

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Error al cargar datos:', err);
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
    if (!balance || balance < points) {
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
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
    <ScreenWrapper bgColor={COLORS.white}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Tarjeta de Saldo */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet" size={32} color={COLORS.white} />
            <Text style={styles.balanceLabel}>Mis Puntos</Text>
          </View>
          <Text style={styles.balanceAmount}>{balance ? balance.toLocaleString() : 0}</Text>
          <Text style={styles.balanceSubtext}>Puntos disponibles</Text>
        </View>

        {/* Sección de Transacciones Recientes */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>

            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.timestamp).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'earned'
                      ? styles.earnedAmount
                      : styles.redeemedAmount,
                  ]}
                >
                  {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Sección de Beneficios Disponibles */}
        {benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beneficios Disponibles</Text>

            {benefits.slice(0, 3).map((benefit) => (
              <View key={benefit.id} style={styles.benefitCard}>
                <View style={styles.benefitHeader}>
                  <View>
                    <Text style={styles.benefitName}>{benefit.name}</Text>
                    <Text style={styles.benefitCategory}>{benefit.category}</Text>
                  </View>
                  <View style={styles.pointsCostBadge}>
                    <Text style={styles.pointsCostText}>{benefit.pointsCost}</Text>
                    <Text style={styles.pointsLabel}>pts</Text>
                  </View>
                </View>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
                <TouchableOpacity
                  style={styles.benefitButton}
                  onPress={() => handleRedeemBenefit(benefit.id, benefit.pointsCost)}
                >
                  <Text style={styles.benefitButtonText}>Canjear Ahora</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Beneficios')}
            >
              <Text style={styles.viewAllButtonText}>Ver todos los beneficios</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mensaje de Error */}
        {error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#f44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botón de Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.white} />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: SPACING.lg,
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
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    marginLeft: SPACING.md,
  },
  balanceAmount: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  balanceSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: TYPOGRAPHY.body2,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: '700',
    color: COLORS.dark,
  },
  viewAll: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.body2,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    color: COLORS.dark,
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    color: COLORS.gray,
    fontSize: TYPOGRAPHY.caption,
  },
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.body1,
  },
  earnedAmount: {
    color: '#4CAF50',
  },
  redeemedAmount: {
    color: '#f44336',
  },
  benefitCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  benefitName: {
    color: COLORS.dark,
    fontSize: TYPOGRAPHY.h6,
    fontWeight: '700',
    marginBottom: 4,
  },
  benefitCategory: {
    color: COLORS.gray,
    fontSize: TYPOGRAPHY.caption,
  },
  pointsCostBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  pointsCostText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.body1,
  },
  pointsLabel: {
    color: '#FF9800',
    fontSize: 10,
  },
  benefitDescription: {
    color: COLORS.gray,
    fontSize: TYPOGRAPHY.body2,
    marginBottom: SPACING.md,
  },
  benefitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  benefitButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.body2,
  },
  viewAllButton: {
    backgroundColor: COLORS.light,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  viewAllButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.body1,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    marginLeft: SPACING.md,
    flex: 1,
    fontSize: TYPOGRAPHY.body2,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 4,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  logoutSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.body1,
  },
});
