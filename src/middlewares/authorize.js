// Middleware para verificar roles de usuario
// TODO: Implementar en Semana 2

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Placeholder - implementar verificación de roles
    next();
  };
};
