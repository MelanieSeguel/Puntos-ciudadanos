import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

/**
 * Botón principal reutilizable
 * @param {string} title - Texto del botón
 * @param {function} onPress - Función al presionar
 * @param {string} backgroundColor - Color de fondo (default: #4CAF50)
 * @param {string} textColor - Color de texto
 * @param {string} borderColor - Color de borde
 * @param {boolean} disabled - Si está deshabilitado
 * @param {boolean} loading - Si está cargando
 */
export default function PrimaryButton({ 
  title, 
  onPress, 
  backgroundColor = '#4CAF50', 
  textColor = '#fff',
  borderColor = 'transparent',
  disabled = false,
  loading = false 
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor,
          borderColor,
          borderWidth: borderColor !== 'transparent' ? 1 : 0,
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
