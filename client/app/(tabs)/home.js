import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import WalletCard from '../../components/WalletCard';
import { walletAPI } from '../../services/api';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [monthPoints, setMonthPoints] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await walletAPI.getBalance(10);
      setTransactions(response.data.transacciones || []);
      
      // Calculate points this month
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const monthlyPoints = response.data.transacciones
        ?.filter(t => {
          const date = new Date(t.fecha);
          return date.getMonth() === thisMonth && 
                 date.getFullYear() === thisYear &&
                 t.tipo === 'EARNED';
        })
        .reduce((sum, t) => sum + t.monto, 0) || 0;
      
      setMonthPoints(monthlyPoints);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre} 👋</Text>
        </View>
      </View>

      {/* Wallet Card */}
      <WalletCard
        onPressQR={() => router.push('/(tabs)/scan')}
        onPressRedeem={() => router.push('/(tabs)/benefits')}
      />

      {/* Stats Cards */}
      {isDesktop && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Puntos este mes:</Text>
            <Text style={styles.statValue}>+{monthPoints}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Nivel:</Text>
            <Text style={styles.statValue}>Brote 🌱</Text>
          </View>
        </View>
      )}

      {/* Gana Puntos Hoy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gana Puntos Hoy</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="♻️"
            title="Recicla Vidrio"
            points="+50pts"
            onPress={() => {}}
          />
          <ActionCard
            icon="🤝"
            title="Voluntariado"
            points="+100pts"
            onPress={() => {}}
          />
          <ActionCard
            icon="👕"
            title="Dona Ropa"
            points="+75pts"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Feed Ciudadano */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feed Ciudadano</Text>
        <View style={styles.feedContainer}>
          <FeedCard
            badge="Energía CO2 Natural"
            title="Jornada de Reforestación"
            description="Un jornada de reforestación con entacinza de las promarias y la enunciación lo"
            date="Noticia · 2022"
          />
          <FeedCard
            badge="Energía CO2 Natural"
            title="Taller de Huerto Urbano"
            description="Aprende a cultivar tus propios alimentos en casa"
            date="Noticia · 2022"
          />
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function ActionCard({ icon, title, points, onPress }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{points}</Text>
      </View>
    </TouchableOpacity>
  );
}

function FeedCard({ badge, title, description, date }) {
  return (
    <View style={styles.feedCard}>
      <View style={styles.feedBadge}>
        <Text style={styles.feedBadgeIcon}>🍃</Text>
        <Text style={styles.feedBadgeText}>{badge}</Text>
      </View>
      <Text style={styles.feedTitle}>{title}</Text>
      <Text style={styles.feedDescription}>{description}</Text>
      <Text style={styles.feedDate}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#2c5282',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: isDesktop ? '31%' : '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  pointsBadge: {
    backgroundColor: '#2c5282',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pointsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  feedContainer: {
    gap: 12,
  },
  feedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedBadgeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  feedBadgeText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  feedDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
    lineHeight: 20,
  },
  feedDate: {
    fontSize: 12,
    color: '#a0aec0',
  },
});
