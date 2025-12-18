import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Panel derecho con estadísticas rápidas
 */
export default function StatsPanel() {
  return (
    <View style={styles.container}>
      {/* Header con usuario */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AM</Text>
          </View>
          <View>
            <Text style={styles.userName}>Alex Morgan</Text>
            <Text style={styles.userEmail}>Alex.exemplo@puntos.cl</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {/* Puntos Badge */}
        <View style={styles.pointsBadge}>
          <View style={styles.pointsIcon}>
            <Ionicons name="star-sharp" size={16} color="#fff" />
          </View>
          <View>
            <Text style={styles.pointsValue}>1,250</Text>
            <Text style={styles.pointsLabel}>PUNTOS</Text>
          </View>
        </View>

        {/* Progreso */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>PUNTOS ESTE MES</Text>
            <Ionicons name="trending-up" size={18} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>+350</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Progreso → Meta: 500</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 20,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statsContainer: {
    gap: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
  },
  pointsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFB300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  pointsLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#999',
  },
});
