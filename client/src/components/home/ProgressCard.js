import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Tarjeta de progreso con barra
 * @param {number} current - Valor actual
 * @param {number} goal - Valor objetivo
 * @param {string} label - Etiqueta
 */
export default function ProgressCard({ current = 0, goal = 500, label = "Puntos este mes" }) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={20} color="#FF9800" />
        <Text style={styles.title}>{label}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${percentage}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {current} / {goal} puntos
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Progreso</Text>
        <Text style={styles.footerValue}>{Math.round(percentage)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerLabel: {
    fontSize: 12,
    color: '#999',
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9800',
  },
});
