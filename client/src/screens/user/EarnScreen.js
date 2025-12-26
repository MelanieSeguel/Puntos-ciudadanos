/**
 * EarnScreen - Pantalla para Ganar Puntos
 * Muestra formas de ganar puntos
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
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

  const renderMission = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleMissionPress(item)}
    >
      <MaterialCommunityIcons name="target" size={32} color={COLORS.primary} style={styles.icon} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name || item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        {item.frequency && <Text style={styles.frequency}>Frecuencia: {item.frequency}</Text>}
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>+{item.points} pts</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bgColor={COLORS.light} safeArea={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Formas de Ganar Puntos</Text>
        <Text style={styles.subtitle}>Acumula puntos fácilmente</Text>
      </View>

      <FlatList
        data={missions}
        renderItem={renderMission}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
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
          ) : (
            <Text style={styles.emptyText}>No hay misiones disponibles</Text>
          )
        }
      />

      <View style={styles.info}>
        <Text style={styles.infoTitle}>💡 Consejo</Text>
        <Text style={styles.infoText}>
          Cuantos más puntos tengas, más beneficios podrás disfrutar.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
