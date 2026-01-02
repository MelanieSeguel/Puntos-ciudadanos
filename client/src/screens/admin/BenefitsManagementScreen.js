import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../theme/theme';

export default function BenefitsManagementScreen() {
  const [loading, setLoading] = useState(false);
  const [benefits, setBenefits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBenefit, setNewBenefit] = useState({
    name: '',
    description: '',
    pointsCost: '',
    stock: '',
    merchantId: '',
    imageUrl: '',
  });

  const renderBenefitCard = ({ item }) => (
    <View style={styles.benefitCard}>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.benefitImage}
      />
      <View style={styles.benefitInfo}>
        <Text style={styles.benefitName}>{item.name}</Text>
        <Text style={styles.benefitDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.benefitMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="star-circle" size={16} color={COLORS.primary} />
            <Text style={styles.metaText}>{item.pointsCost} pts</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="package-variant" size={16} color={COLORS.warning} />
            <Text style={styles.metaText}>Stock: {item.stock}</Text>
          </View>
        </View>
        <Text style={styles.merchantName}>
          <MaterialCommunityIcons name="store" size={14} color={COLORS.gray} /> {item.merchant?.name}
        </Text>
      </View>
      <View style={styles.benefitActions}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper bgColor={COLORS.light}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando beneficios...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bgColor={COLORS.light}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gestión de Beneficios</Text>
          <Text style={styles.subtitle}>{benefits.length} beneficios disponibles</Text>
        </View>
      </View>

      <FlatList
        data={benefits}
        keyExtractor={(item) => item.id}
        renderItem={renderBenefitCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="gift-off" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No hay beneficios creados</Text>
            <Text style={styles.emptySubtext}>
              Crea el primer beneficio para los ciudadanos
            </Text>
          </View>
        }
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modal para crear beneficio */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="gift-outline" size={48} color={COLORS.primary} />
            <Text style={styles.modalTitle}>Crear Nuevo Beneficio</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del Beneficio</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Café Gratis"
                  value={newBenefit.name}
                  onChangeText={(text) => setNewBenefit({ ...newBenefit, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe el beneficio..."
                  value={newBenefit.description}
                  onChangeText={(text) => setNewBenefit({ ...newBenefit, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Costo en Puntos</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="100"
                    value={newBenefit.pointsCost}
                    onChangeText={(text) => setNewBenefit({ ...newBenefit, pointsCost: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Stock Disponible</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50"
                    value={newBenefit.stock}
                    onChangeText={(text) => setNewBenefit({ ...newBenefit, stock: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL de la Imagen</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={newBenefit.imageUrl}
                  onChangeText={(text) => setNewBenefit({ ...newBenefit, imageUrl: text })}
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.noteText}>
                📝 Próximamente: Selector de comercio asociado
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={() => {
                  Alert.alert('Próximamente', 'Funcionalidad de backend en desarrollo');
                  setShowAddModal(false);
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.body1,
    color: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.lg,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitImage: {
    width: 80,
    height: 80,
    borderRadius: LAYOUT.borderRadius.md,
    backgroundColor: COLORS.light,
  },
  benefitInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  benefitName: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  benefitDescription: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  benefitMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.dark,
    fontWeight: '600',
  },
  merchantName: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.gray,
  },
  benefitActions: {
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  input: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    fontSize: TYPOGRAPHY.body1,
    color: COLORS.dark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  noteText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    marginTop: SPACING.lg,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.borderRadius.md,
    backgroundColor: COLORS.light,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.gray,
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.borderRadius.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.white,
  },
});
