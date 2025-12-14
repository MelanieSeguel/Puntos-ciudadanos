// Función wrapper para manejar errores async en controladores
// Evita tener que usar try-catch en cada controlador

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
