import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { walletAPI } from '../services/api';

export default function WalletCard({ onPressQR, onPressRedeem }) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await walletAPI.getBalance(5);
      setBalance(response.data?.saldoActual || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0); // Default a 0 si hay error
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#38b2ac', '#3182ce']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.cardTitle}>Wallet Card</Text>
        <Text style={styles.icon}>🍃</Text>
      </View>

      <View style={styles.balanceContainer}>
        {loading ? (
          <ActivityIndicator color="#ffffff" size="large" />
        ) : (
          <>
            <Text style={styles.amount}>
              {(balance || 0).toLocaleString('es-CL')}
            </Text>
            <Text style={styles.label}>Puntos</Text>
          </>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.buttonSecondary}
          onPress={onPressQR}
        >
          <Text style={styles.buttonSecondaryText}>Escanear QR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={onPressRedeem}
        >
          <Text style={styles.buttonPrimaryText}>Canjear</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  icon: {
    fontSize: 24,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 80,
    justifyContent: 'center',
  },
  amount: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    color: '#ffffff',
    fontSize: 18,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#ed8936',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
