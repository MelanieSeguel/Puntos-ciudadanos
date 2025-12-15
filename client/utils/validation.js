// Utilidades de validación para formularios

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El email es requerido';
  if (!emailRegex.test(email)) return 'Email inválido';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe contener al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Debe contener al menos una minúscula';
  if (!/[0-9]/.test(password)) return 'Debe contener al menos un número';
  if (!/[!@#$%^&*]/.test(password)) return 'Debe contener al menos un carácter especial (!@#$%^&*)';
  return null;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return 'Las contraseñas no coinciden';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'El nombre es requerido';
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (name.length > 255) return 'El nombre es muy largo';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null; // Opcional
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  if (!phoneRegex.test(phone)) return 'Formato de teléfono inválido';
  return null;
};
