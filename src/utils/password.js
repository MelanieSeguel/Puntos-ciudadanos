/**
 * Utilidades para generación y validación de contraseñas seguras
 */

/**
 * Requisitos de contraseña según estándares de seguridad modernos
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/**
 * Genera una contraseña aleatoria segura que cumple con todos los requisitos
 * @param {number} length - Longitud de la contraseña (mínimo 8)
 * @returns {string} Contraseña generada
 */
export const generateSecurePassword = (length = 12) => {
  if (length < PASSWORD_REQUIREMENTS.minLength) {
    length = PASSWORD_REQUIREMENTS.minLength;
  }

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = PASSWORD_REQUIREMENTS.specialChars;

  // Asegurar que al menos haya un carácter de cada tipo
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Llenar el resto con caracteres aleatorios de todos los tipos
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar los caracteres para que no siempre empiecen con el mismo patrón
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

/**
 * Valida si una contraseña cumple con los requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['La contraseña es requerida'] };
  }

  // Longitud mínima
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(
      `La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`
    );
  }

  // Letra mayúscula
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  // Letra minúscula
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  // Número
  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  // Carácter especial
  if (PASSWORD_REQUIREMENTS.requireSpecialChar) {
    const specialCharsRegex = new RegExp(
      `[${PASSWORD_REQUIREMENTS.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`
    );
    if (!specialCharsRegex.test(password)) {
      errors.push(
        `La contraseña debe contener al menos un carácter especial (${PASSWORD_REQUIREMENTS.specialChars})`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Obtiene los requisitos de contraseña en formato legible
 * @returns {string} Descripción de los requisitos
 */
export const getPasswordRequirementsText = () => {
  const requirements = [];

  requirements.push(`Mínimo ${PASSWORD_REQUIREMENTS.minLength} caracteres`);

  if (PASSWORD_REQUIREMENTS.requireUppercase) {
    requirements.push('Al menos una letra mayúscula (A-Z)');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase) {
    requirements.push('Al menos una letra minúscula (a-z)');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber) {
    requirements.push('Al menos un número (0-9)');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar) {
    requirements.push(
      `Al menos un carácter especial (${PASSWORD_REQUIREMENTS.specialChars})`
    );
  }

  return requirements.join('\n• ');
};

/**
 * Obtiene los requisitos en formato simple para el frontend
 * @returns {Object}
 */
export const getPasswordRequirements = () => {
  return { ...PASSWORD_REQUIREMENTS };
};
