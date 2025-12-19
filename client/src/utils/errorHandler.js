/**
 * Manejo centralizado de errores de API
 */

/**
 * Extrae el mensaje de error de una respuesta de error de axios
 */
export const getErrorMessage = (error) => {
  // Si es un error de respuesta HTTP
  if (error.response) {
    const { status, data } = error.response;

    // Mensaje específico del backend
    if (data?.message) {
      return data.message;
    }

    // Mensajes por código de estado
    switch (status) {
      case 400:
        return 'Datos inválidos. Por favor verifica los campos.';
      case 401:
        return 'No autorizado. Por favor inicia sesión nuevamente.';
      case 403:
        return 'No tienes permiso para realizar esta acción.';
      case 404:
        return 'El recurso no fue encontrado.';
      case 409:
        return 'Conflicto: El email ya está registrado.';
      case 422:
        return 'Error de validación. Por favor verifica los datos.';
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      case 503:
        return 'Servicio no disponible. Intenta más tarde.';
      default:
        return `Error ${status}: No se pudo completar la operación.`;
    }
  }

  // Error de red
  if (error.message === 'Network Error') {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }

  // Timeout
  if (error.code === 'ECONNABORTED') {
    return 'La solicitud tardó demasiado. Intenta nuevamente.';
  }

  // Mensaje genérico
  return error.message || 'Ocurrió un error inesperado.';
};

/**
 * Clasifica el tipo de error
 */
export const getErrorType = (error) => {
  if (error.response) {
    const status = error.response.status;
    if (status === 401 || status === 403) return 'AUTH_ERROR';
    if (status >= 400 && status < 500) return 'VALIDATION_ERROR';
    if (status >= 500) return 'SERVER_ERROR';
    return 'HTTP_ERROR';
  }

  if (error.message === 'Network Error') return 'NETWORK_ERROR';
  if (error.code === 'ECONNABORTED') return 'TIMEOUT_ERROR';

  return 'UNKNOWN_ERROR';
};

/**
 * Log de errores (para debugging)
 */
export const logError = (context, error) => {
  console.error(`[${context}]`, {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    data: error.response?.data,
  });
};
