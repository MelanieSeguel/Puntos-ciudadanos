/**
 * Validadores de formularios para la aplicación
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;
const NAME_MIN_LENGTH = 2;

/**
 * Valida un email
 * @returns {valid: boolean, error: string}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'El email es requerido' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Email inválido. Verifica el formato' };
  }
  return { valid: true, error: null };
};

/**
 * Valida una contraseña
 * @returns {valid: boolean, error: string}
 */
export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { valid: false, error: 'La contraseña es requerida' };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `La contraseña debe tener mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    };
  }
  return { valid: true, error: null };
};

/**
 * Valida que dos contraseñas coincidan
 * @returns {valid: boolean, error: string}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Las contraseñas no coinciden' };
  }
  return { valid: true, error: null };
};

/**
 * Valida un nombre
 * @returns {valid: boolean, error: string}
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre es requerido' };
  }
  if (name.trim().length < NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `El nombre debe tener mínimo ${NAME_MIN_LENGTH} caracteres`,
    };
  }
  return { valid: true, error: null };
};

/**
 * Valida un campo requerido
 * @returns {valid: boolean, error: string}
 */
export const validateRequired = (value, fieldName = 'Este campo') => {
  if (!value || !value.toString().trim()) {
    return { valid: false, error: `${fieldName} es requerido` };
  }
  return { valid: true, error: null };
};
