import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { benefitsAPI, pointsAPI, walletAPI } from '../../services/api';

export default function BenefitsScreen() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [benefitsRes, walletRes] = await Promise.all([
        benefitsAPI.getAll({ activo: true }),
        walletAPI.getBalance(1),
      ]);
      
      setBenefits(benefitsRes.data || []);
      setBalance(walletRes.data.saldo);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      Alert.alert('Error', 'No se pudieron cargar los beneficios');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleRedeem = async (benefit) => {
    if (balance < benefit.costoPuntos) {
      Alert.alert(
        'Saldo Insuficiente',
        `Necesitas ${benefit.costoPuntos} puntos. Tienes ${balance} puntos.`
      );
      return;
    }

    Alert.alert(
      'Confirmar Canje',
      `¿Quieres canjear "${benefit.titulo}" por ${benefit.costoPuntos} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Canjear',
          onPress: async () => {
            try {
              await pointsAPI.redeemBenefit(benefit.id);
              Alert.alert('¡Éxito!', 'Beneficio canjeado correctamente');
              await fetchData(); // Refresh data
            } catch (error) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo canjear el beneficio'
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando beneficios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Beneficios</Text>
        <View style={styles.balanceChip}>
          <Text style={styles.balanceText}>{balance} pts</Text>
        </View>
      </View>

      {/* Benefits List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.benefitsList}>
          {benefits.map((benefit) => (
            <BenefitCard
              key={benefit.id}
              benefit={benefit}
              userBalance={balance}
              onRedeem={() => handleRedeem(benefit)}
            />
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function BenefitCard({ benefit, userBalance, onRedeem }) {
  const canAfford = userBalance >= benefit.costoPuntos;

  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitHeader}>
        <Text style={styles.benefitTitle}>{benefit.titulo}</Text>
        <View style={styles.pointsTag}>
          <Text style={styles.pointsTagText}>{benefit.costoPuntos} pts</Text>
        </View>
      </View>

      <Text style={styles.benefitDescription}>{benefit.descripcion}</Text>

      <View style={styles.benefitFooter}>
        <Text style={styles.stockText}>
          Stock: {benefit.stock} {benefit.stock === 1 ? 'unidad' : 'unidades'}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.redeemButton,
            !canAfford && styles.redeemButtonDisabled,
          ]}
          onPress={onRedeem}
          disabled={!canAfford || benefit.stock === 0}
        >
          <Text style={styles.redeemButtonText}>
            {benefit.stock === 0 ? 'Agotado' : 'Canjear'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2c5282',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  balanceChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  balanceText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  benefitsList: {
    padding: 16,
    gap: 16,
  },
  benefitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginRight: 12,
  },
  pointsTag: {
    backgroundColor: '#2c5282',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pointsTagText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    lineHeight: 20,
  },
  benefitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    color: '#a0aec0',
  },
  redeemButton: {
    backgroundColor: '#ed8936',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  redeemButtonDisabled: {
    backgroundColor: '#cbd5e0',
  },
  redeemButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
