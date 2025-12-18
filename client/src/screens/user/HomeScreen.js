import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import BalanceCard from '../../components/home/BalanceCard';
import WebBalanceCard from '../../components/layouts/WebBalanceCard';
import WebLayout from '../../components/layouts/WebLayout';
import ProgressCard from '../../components/home/ProgressCard';
import RecentActivity from '../../components/home/RecentActivity';
import { useResponsive } from '../../hooks/useResponsive';
import { userAPI } from '../../services/api';

export default function HomeScreen({ navigation }) {
  const route = useRoute();
  const { authState } = useContext(AuthContext);
  const { user } = authState;
  const { isWeb } = useResponsive();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [monthProgress, setMonthProgress] = useState({ current: 350, goal: 500 });

  // Detectar la ruta actual
  const currentRoute = route.name?.replace('Stack', '') || 'Home';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getTransactions(5);
      if (response?.data?.transactions) {
        setTransactions(response.data.transactions);
      }
      if (user?.saldo) {
        setBalance(user.saldo);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setBalance(1250);
      setTransactions([
        { description: 'Transporte Ecológico', type: 'scan', points: 15, date: new Date(Date.now() - 2 * 3600000) },
        { description: 'Refill de Agua', type: 'scan', points: 5, date: new Date(Date.now() - 24 * 3600000) },
        { description: 'Canje Recompensa', type: 'redeem', points: -200, date: new Date(Date.now() - 2 * 24 * 3600000) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    navigation?.navigate('ValidateStack');
  };

  const handleRedeem = () => {
    navigation?.navigate('BenefitsStack');
  };

  const handleNavigate = (routeName) => {
    // En web, la navegación usa nombres de Stack
    const stackName = routeName + 'Stack';
    navigation?.navigate(stackName);
  };

  // Contenido principal
  const mainContent = (
    <View style={styles.content}>
      {/* Header con saludo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre || 'Usuario'} 👋</Text>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Balance Card */}
      <WebBalanceCard balance={balance} />

      {/* "Gana Más Puntos Hoy" Section */}
      <View style={styles.earnSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="lightning" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Gana Más Puntos Hoy</Text>
        </View>

        <View style={styles.opportunitiesGrid}>
          {[
            { title: 'Recicla Vidrio', description: 'Lleva tus botellas al punto limpios...', points: '+50 pts', icon: 'leaf' },
            { title: 'Voluntariado', description: 'Únete a la limpieza de parques este sábado.', points: '+100 pts', icon: 'heart' },
            { title: 'Dona Ropa', description: 'Dale una segunda vida a tus prendas usadas.', points: '+75 pts', icon: 'shirt' },
          ].map((opp, idx) => (
            <View key={idx} style={styles.opportunityCard}>
              <View style={styles.oppIcon}>
                <Ionicons name={opp.icon} size={24} color="#4CAF50" />
              </View>
              <Text style={styles.oppTitle}>{opp.title}</Text>
              <Text style={styles.oppDesc}>{opp.description}</Text>
              <View style={styles.oppFooter}>
                <Text style={styles.oppPoints}>{opp.points}</Text>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Si es web, usar layout con sidebar
  if (isWeb && Platform.OS === 'web') {
    return (
      <WebLayout activeRoute={currentRoute} onNavigate={handleNavigate}>
        {mainContent}
      </WebLayout>
    );
  }

  // Si es móvil, usar layout vertical
  return (
    <ScrollView 
      style={styles.mobileContainer}
    >
      <ScreenHeader 
        title={`¡Hola, ${user?.nombre || 'Usuario'}!`}
        subtitle={new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
        backgroundColor="#4CAF50"
      />

      <View style={styles.mobileContent}>
        <BalanceCard 
          balance={balance} 
          title="Balance Disponible"
        />
        <ProgressCard 
          current={monthProgress.current}
          goal={monthProgress.goal}
          label="Puntos este mes"
        />
        <RecentActivity 
          transactions={transactions}
          maxItems={3}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    lineHeight: 32,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 6,
  },
  earnSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  opportunitiesGrid: {
    flexDirection: 'row',
  },
  opportunityCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 12,
  },
  oppIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  oppTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  oppDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 12,
  },
  oppFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  oppPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },

  // Mobile styles
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mobileContent: {
    padding: 16,
  },
});
