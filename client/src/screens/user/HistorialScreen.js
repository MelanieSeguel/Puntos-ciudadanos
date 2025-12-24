import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/theme';

export default function HistorialScreen() {
  const [historial] = useState([
    {
      id: 1,
      title: 'Transporte Ecológico',
      description: 'Uso de bicicleta compartida por 30 min.',
      points: '+15',
      color: '#4CAF50',
      icon: 'bike',
      date: '18 Diciembre 2025, 14:30',
    },
    {
      id: 2,
      title: 'Refill de Agua',
      description: 'Estación de carga Parque Central.',
      points: '+5',
      color: '#2196F3',
      icon: 'water',
      date: '17 Diciembre 2025, 10:15',
    },
    {
      id: 3,
      title: 'Voluntariado',
      description: 'Limpieza de parques.',
      points: '+100',
      color: '#9C27B0',
      icon: 'hand-heart',
      date: '16 Diciembre 2025, 09:00',
    },
    {
      id: 4,
      title: 'Canje Recompensa',
      description: 'Descuento Pizzería Bella Napoli.',
      points: '-200',
      color: '#f44336',
      icon: 'heart',
      date: '15 Diciembre 2025, 18:45',
    },
    {
      id: 5,
      title: 'Donación de Ropa',
      description: 'Donaste 5 prendas al centro comunitario.',
      points: '+75',
      color: '#FF9800',
      icon: 'tshirt-crew',
      date: '14 Diciembre 2025, 16:20',
    },
    {
      id: 6,
      title: 'Reciclaje de Vidrio',
      description: 'Llevaste 10 botellas al punto limpio.',
      points: '+50',
      color: '#4CAF50',
      icon: 'recycle',
      date: '13 Diciembre 2025, 11:30',
    },
  ]);

  return (
    <ScreenWrapper bgColor={COLORS.white} safeArea={false}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'web' ? 0 : SPACING.md }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Historial de Actividades</Text>
          <Text style={styles.subtitle}>Todas tus transacciones de puntos</Text>
        </View>

        <View style={styles.listContainer}>
          {historial.map((item) => (
            <View key={item.id} style={styles.historialItem}>
              <View style={[styles.itemIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={item.color}
                />
              </View>

              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
              </View>

              <Text style={[styles.itemPoints, { color: item.color }]}>
                {item.points}
              </Text>
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
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  listContainer: {
    gap: SPACING.md,
  },
  historialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
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
  },
  itemContent: {
    flex: 1,
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
  itemPoints: {
    fontSize: 14,
    fontWeight: '700',
  },
});
