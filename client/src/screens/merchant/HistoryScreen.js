/**
 * HistoryScreen - Historial de validaciones para Comercios
 * Muestra el registro de cupones validados
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';
import { merchantAPI } from '../../services/api';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await merchantAPI.getHistory(50, 0);
      const redemptions = response.data?.data?.redemptions || [];
      
      // Formatear datos para el componente
      const formatted = redemptions.map(r => ({
        id: r.id,
        userId: r.user?.id || 'N/A',
        userEmail: r.user?.email || 'Sin correo',
        userName: r.user?.name || 'Usuario',
        benefitTitle: r.benefit?.title || 'Beneficio',
        points: r.benefit?.pointsCost || 0,
        date: new Date(r.redeemedAt),
      }));

      setTransactions(formatted);
    } catch (err) {
      console.error('[HistoryScreen] Error cargando historial:', err);
      setError('No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <MaterialCommunityIcons name="check-circle" size={32} color={COLORS.success} style={styles.transactionIcon} />
      <View style={styles.transactionLeft}>
        <Text style={styles.userEmail}>{item.userEmail}</Text>
        <Text style={styles.userId}>ID: {item.userId.substring(0, 8)}...</Text>
        <Text style={styles.benefitTitle}>{item.benefitTitle}</Text>
        <Text style={styles.dateText}>
          {formatDate(item.date)} • {formatTime(item.date)}
        </Text>
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{item.points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.merchant} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 90 : SPACING.md }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Historial de Validaciones</Text>
          <Text style={styles.subtitle}>{transactions.length} canjes realizados</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-list" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Sin validaciones aún</Text>
            <Text style={styles.emptySubtext}>Los cupones validados aparecerán aquí</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[COLORS.merchant]}
              />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
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
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
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
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  transactionIcon: {
    marginRight: SPACING.md,
  },
  transactionLeft: {
    flex: 1,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs / 2,
  },
  userId: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
    fontFamily: 'monospace',
    marginBottom: SPACING.xs,
  },
  benefitTitle: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.merchant,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
  pointsBadge: {
    backgroundColor: COLORS.merchant + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.md,
    alignItems: 'center',
    minWidth: 60,
  },
  pointsText: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: '700',
    color: COLORS.merchant,
  },
  pointsLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.merchant,
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  errorText: {
    marginTop: SPACING.md,
    color: COLORS.error,
    fontSize: TYPOGRAPHY.body2,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.merchant,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.md,
  },
  retryText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.body2,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
