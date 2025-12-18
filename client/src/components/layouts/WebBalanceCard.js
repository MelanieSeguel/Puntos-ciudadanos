import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../common/PrimaryButton';

/**
 * Tarjeta principal de balance para web - diseño mejorado
 */
export default function WebBalanceCard({ balance = 1250 }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>BALANCE DISPONIBLE</Text>
          <Text style={styles.balance}>{balance.toLocaleString('es-ES')}</Text>
          <Text style={styles.unit}>Puntos</Text>
        </View>
        <View style={styles.illustration}>
          <View style={styles.illuBox} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <PrimaryButton
          title="Escanear QR"
          onPress={() => {}}
          backgroundColor="#4CAF50"
        />
        <View style={styles.buttonDivider} />
        <PrimaryButton
          title="Canjear"
          onPress={() => {}}
          backgroundColor="#fff"
          textColor="#333"
          borderColor="#e0e0e0"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 28,
    paddingRight: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balance: {
    fontSize: 52,
    fontWeight: '700',
    color: '#333',
    lineHeight: 56,
  },
  unit: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  illustration: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illuBox: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  buttonDivider: {
    width: 12,
  },
});
