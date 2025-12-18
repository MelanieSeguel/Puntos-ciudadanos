import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Tarjeta principal que muestra el saldo actual
 * @param {number} balance - Saldo en puntos
 * @param {string} title - Título de la tarjeta
 */
export default function BalanceCard({ balance = 0, title = "Balance Disponible" }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="star-outline" size={24} color="#FFB300" />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceValue}>{balance.toLocaleString('es-ES')}</Text>
        <Text style={styles.balanceLabel}>Puntos</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="arrow-down-outline" size={16} color="#4CAF50" />
          <Text style={styles.footerText}>Últimas ganancias</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  balanceContainer: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});
