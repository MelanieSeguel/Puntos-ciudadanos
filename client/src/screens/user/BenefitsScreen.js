/**
 * BenefitsScreen - Pantalla de Beneficios para Usuarios
 * Muestra beneficios disponibles y canjeados
 */

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';
import { benefitsAPI, walletAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';

export default function BenefitsScreen({ navigation: navigationProp }) {
  const hookNavigation = useNavigation();
  const navigation = Platform.OS === 'web' && navigationProp ? navigationProp : hookNavigation;
  const { authState } = useContext(AuthContext);
  const [allBenefits, setAllBenefits] = useState([]); // Todos los beneficios sin filtrar
  const [benefits, setBenefits] = useState([]); // Beneficios filtrados
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    if (authState.authenticated) {
      loadData();
    }
  }, [authState.authenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [benefitsRes, userRes] = await Promise.all([
        benefitsAPI.getAll(),
        walletAPI.getBalance(),
      ]);

      const benefitsList = benefitsRes.data?.data || [];
      console.log('[BenefitsScreen] Primer beneficio:', JSON.stringify(benefitsList[0], null, 2));
      setAllBenefits(benefitsList);
      applyFilter('Todos', benefitsList); // Aplicar filtro inicial

      const user = userRes.data?.data;
      setUserBalance(user?.wallet?.balance || 0);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('[BenefitsScreen] Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filtrado local sin peticiones al servidor
  const applyFilter = (filter, benefitsList = allBenefits) => {
    setActiveFilter(filter);
    
    if (filter === 'Todos') {
      setBenefits(benefitsList);
      return;
    }

    const categoryMap = {
      'Comida': ['COMIDA', 'POSTRE', 'BEBIDA'],
      'Servicios': ['SERVICIO'],
      'Cultura': ['CULTURA'], // Por si agregan esta categoría
    };

    const categories = categoryMap[filter] || [];
    const filtered = benefitsList.filter(b => categories.includes(b.category));
    setBenefits(filtered);
  };

  const handleBenefitPress = (benefit) => {
    navigation.navigate('BenefitDetail', {
      benefitId: benefit.id,
      benefit: benefit,
      userBalance: userBalance,
    });
  };

  const renderBenefit = ({ item }) => {
    const canAfford = userBalance >= item.pointsCost;
    const hasStock = item.stock > 0;
    const isAvailable = item.active && hasStock;
    const isLowStock = item.stock > 0 && item.stock <= 10;
    
    // Determinar el merchant name
    const merchantName = item.merchant?.merchantProfile?.storeName || item.merchant?.name || 'Comercio';
    
    // Mapear categorías a colores e íconos
    const categoryConfig = {
      DESCUENTO: { color: '#4CAF50', icon: 'tag', label: 'DESCUENTO' },
      BEBIDA: { color: '#FF9800', icon: 'coffee', label: 'BEBIDA' },
      COMIDA: { color: '#F44336', icon: 'food', label: 'GASTRONOMÍA' },
      POSTRE: { color: '#E91E63', icon: 'cupcake', label: 'POSTRE' },
      SERVICIO: { color: '#2196F3', icon: 'truck-delivery', label: 'SERVICIO' },
    };
    
    const config = categoryConfig[item.category] || { color: '#9E9E9E', icon: 'gift', label: 'OTRO' };
    
    // Calcular % de descuento si aplica (solo visual)
    const discountPercent = item.category === 'DESCUENTO' ? '20% OFF' : null;

    return (
      <TouchableOpacity
        style={[
          styles.benefitCard,
          !isAvailable && styles.benefitCardDisabled,
        ]}
        onPress={() => isAvailable && handleBenefitPress(item)}
        disabled={!isAvailable}
        activeOpacity={0.8}
      >
        {/* Imagen del beneficio */}
        <View style={[styles.benefitImage, { backgroundColor: config.color + '20' }]}>
          <MaterialCommunityIcons
            name={config.icon}
            size={80}
            color={config.color}
          />
          
          {/* Badge de descuento */}
          {discountPercent && (
            <View style={[styles.discountBadge, { backgroundColor: COLORS.success }]}>
              <Text style={styles.discountText}>{discountPercent}</Text>
            </View>
          )}
          
          {/* Badge de bajo stock */}
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>POCOS EN STOCK</Text>
            </View>
          )}
        </View>

        {/* Contenido de la tarjeta */}
        <View style={styles.benefitInfo}>
          {/* Categoría */}
          <View style={styles.categoryRow}>
            <Text style={[styles.categoryText, { color: config.color }]}>
              {config.label}
            </Text>
            <View style={[styles.categoryIcon, { backgroundColor: config.color }]}>
              <MaterialCommunityIcons name={config.icon} size={16} color={COLORS.white} />
            </View>
          </View>

          {/* Título */}
          <Text style={[styles.benefitName, !isAvailable && styles.benefitNameDisabled]}>
            {item.title}
          </Text>

          {/* Comercio */}
          <View style={styles.merchantRow}>
            <MaterialCommunityIcons name="store" size={14} color={COLORS.gray} />
            <Text style={styles.merchantText}>{merchantName}</Text>
          </View>

          {/* Precio */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>VALOR</Text>
            <View style={[styles.priceBadge, !canAfford && styles.priceBadgeDisabled]}>
              <Text style={[styles.priceText, !canAfford && styles.priceTextDisabled]}>
                {item.pointsCost} pts
              </Text>
            </View>
          </View>

          {/* Advertencias */}
          {!hasStock && (
            <View style={styles.warningBadge}>
              <MaterialCommunityIcons name="alert-circle" size={14} color={COLORS.error} />
              <Text style={styles.warningText}>Sin stock</Text>
            </View>
          )}
          {hasStock && !canAfford && (
            <View style={[styles.warningBadge, { backgroundColor: COLORS.warning + '20' }]}>
              <MaterialCommunityIcons name="alert" size={14} color={COLORS.warning} />
              <Text style={[styles.warningText, { color: COLORS.warning }]}>Saldo insuficiente</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper bgColor={COLORS.light} safeArea={false} padding={0}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando beneficios...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false} padding={0}>
      <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 90 : SPACING.md }]}>
        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterHeader}>
            <View style={styles.filterTitleRow}>
              <MaterialCommunityIcons name="filter-variant" size={20} color={COLORS.primary} />
              <Text style={styles.filterLabel}>Filtrar Recompensas</Text>
            </View>
            <View style={styles.filterButtons}>
              {['Todos', 'Comida', 'Servicios'].map((filter) => {
                const isActive = activeFilter === filter;
                const count = filter === 'Todos' ? allBenefits.length : 
                             allBenefits.filter(b => {
                               if (filter === 'Comida') return ['COMIDA', 'POSTRE', 'BEBIDA'].includes(b.category);
                               if (filter === 'Servicios') return b.category === 'SERVICIO';
                               return false;
                             }).length;
                
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterButton, isActive && styles.filterButtonActive]}
                    onPress={() => applyFilter(filter)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
                      {filter}
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
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={benefits}
          renderItem={renderBenefit}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          style={styles.list}
          numColumns={Platform.OS === 'web' ? 3 : 1}
          key={Platform.OS === 'web' ? 'grid' : 'list'}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="gift-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyText}>No hay beneficios disponibles</Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? SPACING.lg : SPACING.md,
    ...(Platform.OS === 'web' && {
      maxWidth: 1400,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  
  // Filtros
  filtersContainer: {
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
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
  
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: Platform.OS === 'web' ? 0 : SPACING.md,
    paddingBottom: SPACING.xl,
  },
  
  // Nueva tarjeta estilo moderno
  benefitCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...LAYOUT.shadowMedium,
    ...(Platform.OS === 'web' ? {
      flex: 1,
      maxWidth: '32%',
      marginHorizontal: '0.5%',
      minHeight: 320,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    } : {
      width: '100%',
    }),
  },
  benefitCardDisabled: {
    opacity: 0.6,
  },
  
  // Imagen superior
  benefitImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Badges flotantes
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  lowStockBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lowStockText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Información de la tarjeta
  benefitInfo: {
    padding: SPACING.md,
  },
  
  // Fila de categoría
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Título
  benefitName: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  benefitNameDisabled: {
    color: COLORS.gray,
  },
  
  // Fila de comercio
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 4,
  },
  merchantText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  
  // Fila de precio
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray,
    letterSpacing: 0.5,
  },
  priceBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceBadgeDisabled: {
    backgroundColor: COLORS.gray,
  },
  priceText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  priceTextDisabled: {
    opacity: 0.7,
  },
  
  // Badge de advertencia
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: SPACING.sm,
    gap: 4,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  
  // Estados de carga y error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
  errorContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
});
