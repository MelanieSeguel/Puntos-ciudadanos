import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch, 
  validateName 
} from '../../utils/validation';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};
    
    const nombreError = validateName(formData.nombre);
    if (nombreError) newErrors.nombre = nombreError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const matchError = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (matchError) newErrors.confirmPassword = matchError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/home');
    } else {
      setErrors({ general: result.error });
    }
  };

  return (
    <LinearGradient
      colors={['#2c5282', '#3182ce']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>🍃</Text>
            <Text style={styles.title}>Únete</Text>
            <Text style={styles.subtitle}>Crea tu cuenta</Text>
          </View>

          <View style={styles.form}>
            {errors.general ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#fc8181" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            ) : null}

            <View>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                placeholder="Nombre *"
                placeholderTextColor="#a0aec0"
                value={formData.nombre}
                onChangeText={(text) => {
                  setFormData({ ...formData, nombre: text });
                  setErrors({ ...errors, nombre: null });
                }}
              />
              {errors.nombre && <Text style={styles.errorTextSmall}>{errors.nombre}</Text>}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor="#a0aec0"
              value={formData.apellido}
              onChangeText={(text) => setFormData({ ...formData, apellido: text })}
            />

            <View>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email *"
                placeholderTextColor="#a0aec0"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  setErrors({ ...errors, email: null });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {errors.email && <Text style={styles.errorTextSmall}>{errors.email}</Text>}
            </View>

            <View>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Contraseña *"
                placeholderTextColor="#a0aec0"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  setErrors({ ...errors, password: null });
                }}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorTextSmall}>{errors.password}</Text>}
            </View>

            <View>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Confirmar Contraseña *"
                placeholderTextColor="#a0aec0"
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  setErrors({ ...errors, confirmPassword: null });
                }}
                secureTextEntry
              />
              {errors.confirmPassword && <Text style={styles.errorTextSmall}>{errors.confirmPassword}</Text>}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              placeholderTextColor="#a0aec0"
              value={formData.telefono}
              onChangeText={(text) => setFormData({ ...formData, telefono: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Dirección"
              placeholderTextColor="#a0aec0"
              value={formData.direccion}
              onChangeText={(text) => setFormData({ ...formData, direccion: text })}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Inicia sesión</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e0',
  },
  form: {
    gap: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 129, 129, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#fc8181',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    color: '#fc8181',
    fontSize: 14,
    fontWeight: '500',
  },
  errorTextSmall: {
    color: '#fc8181',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2d3748',
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#fc8181',
  },
  button: {
    backgroundColor: '#ed8936',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  link: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
