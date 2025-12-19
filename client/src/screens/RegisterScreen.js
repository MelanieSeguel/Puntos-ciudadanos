/**
 * RegisterScreen - Pantalla de registro de usuarios con validaciones
 */

import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../layouts/ScreenWrapper';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import * as validators from '../utils/validators';
import { getErrorMessage } from '../utils/errorHandler';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validar campos en tiempo real
  useEffect(() => {
    const newErrors = {};

    if (touched.name) {
      const nameValidation = validators.validateName(name);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error;
      }
    }

    if (touched.email) {
      const emailValidation = validators.validateEmail(email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error;
      }
    }

    if (touched.password) {
      const passwordValidation = validators.validatePassword(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.error;
      }
    }

    if (touched.confirmPassword) {
      const matchValidation = validators.validatePasswordMatch(password, confirmPassword);
      if (!matchValidation.valid) {
        newErrors.confirmPassword = matchValidation.error;
      }
    }

    setErrors(newErrors);
  }, [name, email, password, confirmPassword, touched]);

  const handleRegister = async () => {
    // Marcar todos como tocados
    const allTouched = { name: true, email: true, password: true, confirmPassword: true };
    setTouched(allTouched);

    // Validar todos los campos
    const nameValidation = validators.validateName(name);
    const emailValidation = validators.validateEmail(email);
    const passwordValidation = validators.validatePassword(password);
    const matchValidation = validators.validatePasswordMatch(password, confirmPassword);

    if (
      !nameValidation.valid ||
      !emailValidation.valid ||
      !passwordValidation.valid ||
      !matchValidation.valid
    ) {
      Alert.alert('Error de Validación', 'Por favor completa correctamente todos los campos');
      return;
    }

    setLoading(true);
    try {
      await register(email.toLowerCase().trim(), password, name.trim());
      // El AuthContext maneja la navegación automáticamente
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Alert.alert('Error de Registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bgColor={COLORS.white}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a nuestro programa de puntos</Text>
        </View>

        <View style={styles.form}>
          {/* Campo Nombre */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={[
                styles.input,
                touched.name && errors.name && styles.inputError,
              ]}
              placeholder="Juan Pérez"
              placeholderTextColor={COLORS.gray}
              value={name}
              onChangeText={setName}
              onBlur={() => setTouched({ ...touched, name: true })}
              editable={!loading}
            />
            {touched.name && errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Campo Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={[
                styles.input,
                touched.email && errors.email && styles.inputError,
              ]}
              placeholder="tu@email.com"
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched({ ...touched, email: true })}
              editable={!loading}
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Campo Contraseña */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[
                styles.input,
                touched.password && errors.password && styles.inputError,
              ]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={COLORS.gray}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTouched({ ...touched, password: true })}
              editable={!loading}
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Campo Confirmar Contraseña */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
              style={[
                styles.input,
                touched.confirmPassword && errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Repite la contraseña"
              placeholderTextColor={COLORS.gray}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              editable={!loading}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (loading || Object.keys(errors).length > 0) && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
  form: {
    gap: SPACING.md,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body1,
    color: COLORS.dark,
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.gray,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
