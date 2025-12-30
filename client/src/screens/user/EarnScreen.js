/**
 * EarnScreen - Pantalla para Ganar Puntos
 * Muestra formas de ganar puntos
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import WebHeader from '../../components/WebHeader';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';
import { missionsAPI } from '../../services/api';

function EarnScreenComponent({ navigation: navigationProp }) {
  // En web usar el prop, en móvil usar el hook
  let navigation;
  if (Platform.OS === 'web') {
    navigation = navigationProp;
  } else {
    navigation = useNavigation();
  }

  const [missions, setMissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await missionsAPI.getAvailable();
      console.log('[EarnScreen] Respuesta API:', response.data);
      const missionsData = response.data.missions || response.data.data || [];
      console.log('[EarnScreen] Misiones parseadas:', missionsData);
      console.log('[EarnScreen] Cantidad de misiones:', missionsData.length);
      setMissions(missionsData);
    } catch (err) {
      console.error('[EarnScreen] Error cargando misiones:', err);
      setError('No pudimos cargar las misiones');
    } finally {
      setLoading(false);
    }
  };

  const handleMissionPress = (mission) => {
    console.log('[EarnScreen] Navegando a MissionSubmission', mission.id);
    if (!navigation) {
      console.error('[EarnScreen] No navigation object available');
      return;
    }
    
    // Para navegación anidada: Tab.Screen name="Earn" > EarnStack > MissionSubmission
    const params = {
      missionId: mission.id,
      missionName: mission.name || mission.title,
      missionPoints: mission.points,
    };
    
    if (Platform.OS === 'web') {
      // En web, usar el prop navigation que pasa WebLayout
      navigation.navigate('MissionSubmission', params);
    } else {
      // En móvil, navegar a través del Stack dentro del Tab
      navigation.push('MissionSubmission', params);
    }
  };

  const renderMission = (item, i) => {
    // Alternar iconos y tipo de botón para demo visual
    const icons = ['recycle', 'water', 'account-heart', 'leaf', 'blood-bag', 'food', 'fire-truck', 'volume-high'];
    const icon = item.icon || icons[i % icons.length];
    const ctaType = i % 2 === 0 ? 'solid' : 'outline';
    const ctaLabel = ctaType === 'solid' ? 'Participar' : 'Ver Detalles';
    return (
      <View key={item.id} style={styles.visualCard}>
        {/* Badge de puntos */}
        <View style={styles.visualPointsBadge}>
          <Text style={styles.visualPointsText}>+{item.points} pts</Text>
        </View>
        {/* Icono redondo */}
        <View style={styles.visualIconCircle}>
          <MaterialCommunityIcons name={icon} size={28} color={COLORS.primary} />
        </View>
        {/* Contenido */}
        <Text style={styles.visualCardTitle}>{item.name || item.title}</Text>
        <Text style={styles.visualCardDesc}>{item.description}</Text>
        {/* Botón principal */}
        <TouchableOpacity
          style={ctaType === 'outline' ? styles.visualBtnOutline : styles.visualBtnSolid}
          onPress={() => handleMissionPress(item)}
        >
          <Text style={ctaType === 'outline' ? styles.visualBtnOutlineText : styles.visualBtnSolidText}>
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false} maxWidth={false} padding={0}>
      <WebHeader title="Gana Puntos" />
      <ScrollView
        style={{ flex: 1, width: '100%', minHeight: '100vh' }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 0, minHeight: '100vh', width: '100%', paddingTop: Platform.OS === 'web' ? 90 : 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptyText}>Cargando misiones...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadMissions}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : missions.length === 0 ? (
            <Text style={styles.emptyText}>No hay misiones disponibles</Text>
          ) : (
            missions.map((m, i) => (
              <View key={m.id} style={styles.gridCard}>
                {renderMission(m, i)}
              </View>
            ))
          )}
        </View>
        <View style={[styles.info, { width: '100%', maxWidth: '100vw' }] }>
          <Text style={styles.infoTitle}>💡 Consejo</Text>
          <Text style={styles.infoText}>
            Cuantos más puntos tengas, más beneficios podrás disfrutar.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
    gridContainer: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      width: '100%',
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 32,
      gap: Platform.OS === 'web' ? 24 : 0,
      rowGap: Platform.OS === 'web' ? 24 : 0,
      columnGap: Platform.OS === 'web' ? 24 : 0,
      paddingTop: 8,
      paddingBottom: 8,
      paddingHorizontal: Platform.OS === 'web' ? 32 : 0,
      minHeight: 400,
      boxSizing: Platform.OS === 'web' ? 'border-box' : undefined,
    },
    gridCard: {
      flexBasis: Platform.OS === 'web' ? 0 : '100%',
      flexGrow: Platform.OS === 'web' ? 1 : 0,
      flexShrink: 1,
      minWidth: Platform.OS === 'web' ? 260 : 200,
      marginBottom: Platform.OS === 'web' ? 24 : 24,
      marginRight: Platform.OS === 'web' ? 0 : 0,
      display: 'flex',
    },
  visualCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // boxShadow solo en web
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 8px #0001' } : {}),
    padding: 20,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minWidth: 220,
    maxWidth: Platform.OS === 'web' ? 340 : '100%',
    width: '100%',
    height: '80%',
  },
  visualPointsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F5FFF2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  visualPointsText: {
    color: '#3CB371',
    fontWeight: '700',
    fontSize: 16,
  },
  visualIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  visualCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
    marginTop: 4,
    textAlign: 'left',
  },
  visualCardDesc: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: 'left',
  },
  visualBtnSolid: {
    backgroundColor: '#6FCF97',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    marginTop: 'auto',
  },
  visualBtnSolidText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  visualBtnOutline: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6FCF97',
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    marginTop: 'auto',
  },
  visualBtnOutlineText: {
    color: '#6FCF97',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
  list: {
    marginBottom: SPACING.xl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...LAYOUT.shadowSmall,
  },
  icon: {
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
  frequency: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.info,
    marginTop: SPACING.xs,
  },
  pointsBadge: {
    backgroundColor: COLORS.success,
    borderRadius: LAYOUT.borderRadius.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  pointsText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body1,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.body1,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.md,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.body1,
  },
  info: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    borderRadius: LAYOUT.borderRadius.md,
    padding: SPACING.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    lineHeight: 20,
  },
  listContent: {
    paddingTop: Platform.OS === 'web' ? 0 : SPACING.md,
  },
});

export default EarnScreenComponent;
