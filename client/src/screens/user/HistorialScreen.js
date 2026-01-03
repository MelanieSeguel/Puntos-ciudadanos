import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/theme';
import { pointsAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';

export default function HistorialScreen() {
  const navigation = useNavigation();
  const [historial, setHistorial] = useState([]);
  const [allHistorial, setAllHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pointsAPI.getTransactions(100, 0);
      const transactions = response.data?.data || [];
      
      const formattedHistorial = transactions.map(t => {
        const isMissionApproved = t.type === 'EARNED' && t.description?.includes('Misión aprobada');
        
        const iconMap = {
          EARNED: isMissionApproved ? 'trophy' : 'plus-circle',
          SPENT: 'gift',
          TRANSFER: 'swap-horizontal',
        };
        
        const colorMap = {
          EARNED: '#4CAF50',
          SPENT: '#f44336',
          TRANSFER: '#2196F3',
        };

        return {
          id: t.id,
          title: t.description || 'Transacción',
          description: t.type === 'EARNED' 
            ? (isMissionApproved ? 'Misión completada' : 'Puntos ganados')
            : t.type === 'SPENT' 
              ? 'Beneficio canjeado' 
              : 'Transferencia',
          points: `${t.type === 'EARNED' ? '+' : '-'}${t.amount}`,
          color: colorMap[t.type] || '#9C27B0',
          icon: iconMap[t.type] || 'history',
          date: t.createdAt,
          type: t.type,
          metadata: t.metadata, // Incluir metadata con redemptionId, qrCode, etc.
          benefitId: t.benefitId, // ID del beneficio
        };
      });
      
      setAllHistorial(formattedHistorial);
      setHistorial(formattedHistorial);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('[HistorialScreen] Error al cargar historial:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistorial();
    setRefreshing(false);
  };

  const applyFilter = (filter) => {
    setActiveFilter(filter);
    
    if (filter === 'Todos') {
      setHistorial(allHistorial);
      return;
    }

    const filtered = allHistorial.filter(item => item.type === filter);
    setHistorial(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'Hace un momento';
    }
    if (diffMins < 60) {
      return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    }
    if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    }
    if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    return `${day} ${month} ${year}, ${time}`;
  };

  const handleViewRedemption = (item) => {
    // Navegar a la pantalla de QR con los datos del canje
    const metadata = item.metadata || {};
    navigation.navigate('QRCode', {
      redemptionId: metadata.redemptionId,
      qrCode: metadata.qrCode,
      benefitName: metadata.benefitTitle || item.title.replace('Canje: ', ''),
      benefitId: item.benefitId || metadata.benefitId,
      expiresAt: metadata.expiresAt,
    });
  };

  if (loading) {
    return (
      <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false} padding={0}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'web' ? 90 : SPACING.md }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterHeader}>
            <View style={styles.filterTitleRow}>
              <MaterialCommunityIcons name="filter-variant" size={20} color={COLORS.primary} />
              <Text style={styles.filterLabel}>Filtrar Transacciones</Text>
            </View>
            <View style={styles.filterButtons}>
              {['Todos', 'EARNED', 'SPENT'].map((filter) => {
                const isActive = activeFilter === filter;
                const displayName = filter === 'Todos' ? 'Todos' : filter === 'EARNED' ? 'Ganado' : 'Gastado';
                const count = filter === 'Todos' ? allHistorial.length : 
                             allHistorial.filter(item => item.type === filter).length;
                
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterButton, isActive && styles.filterButtonActive]}
                    onPress={() => applyFilter(filter)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
                      {displayName}
                    </Text>
                    {filter === 'Todos' && (
                      <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                        <Text style={styles.countText}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={24} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadHistorial}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && historial.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No hay transacciones aún</Text>
            <Text style={styles.emptySubtext}>Comienza a ganar puntos completando misiones</Text>
          </View>
        )}

        <View style={styles.listContainer}>
          {historial.map((item) => (
            <View key={item.id} style={styles.historialItem}>
              <View style={[styles.itemIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
              </View>
              <View style={styles.pointsContainer}>
                <Text style={[styles.itemPoints, { color: item.color }]}>{item.points}</Text>
                {item.type === 'EARNED' && (
                  <View style={[styles.typeBadge, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.typeBadgeText, { color: '#4CAF50' }]}>Ganado</Text>
                  </View>
                )}
                {item.type === 'SPENT' && (
                  <View style={[styles.typeBadge, { backgroundColor: '#FFEBEE' }]}>
                    <Text style={[styles.typeBadgeText, { color: '#f44336' }]}>Gastado</Text>
                  </View>
                )}
              </View>
              {item.type === 'SPENT' && item.metadata?.qrCode && (
                <TouchableOpacity 
                  style={styles.qrButton}
                  onPress={() => handleViewRedemption(item)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="qrcode" size={20} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    ...(Platform.OS === 'web' && {
      paddingVertical: SPACING.md,
    }),
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.light,
    gap: SPACING.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  countBadge: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray,
    fontSize: TYPOGRAPHY.body2,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.body2,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: '600',
    color: COLORS.dark,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    textAlign: 'center',
  },
  listContainer: {
    gap: SPACING.md,
  },
  historialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 0,
    paddingLeft: SPACING.md,
    paddingRight: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  itemContent: {
    flex: 1,
    paddingVertical: SPACING.md,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  itemDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
  },
  pointsContainer: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  itemPoints: {
    fontWeight: '700',
    fontSize: 16,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  qrButton: {
    width: 50,
    alignSelf: 'stretch',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
