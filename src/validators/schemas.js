import { z } from 'zod';

// Esquema base para email
const emailSchema = z
  .string({ required_error: 'El email es requerido' })
  .email({ message: 'Email inválido' })
  .min(5, 'El email debe tener al menos 5 caracteres')
  .max(255, 'El email no puede exceder 255 caracteres')
  .toLowerCase()
  .trim();

// Esquema base para password
const passwordSchema = z
  .string({ required_error: 'La contraseña es requerida' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña no puede exceder 100 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'
  );

// Esquema para registro de usuario
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .trim(),
  
  email: emailSchema,
  
  password: passwordSchema,
  
  confirmPassword: z.string({ required_error: 'Confirma tu contraseña' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Esquema para login (sin validación de formato, solo que existan los campos)
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email({ message: 'Email inválido' })
    .trim(),
  
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida'),
});

// Esquema para actualizar perfil de usuario
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .trim()
    .optional(),
  
  email: emailSchema.optional(),
});

// Esquema para cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'La contraseña actual es requerida' })
    .min(1, 'La contraseña actual es requerida'),
  
  newPassword: passwordSchema,
  
  confirmNewPassword: z.string({ required_error: 'Confirma tu nueva contraseña' }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword'],
});

// Esquema para crear beneficio (admin)
export const createBenefitSchema = z.object({
  title: z
    .string({ required_error: 'El título es requerido' })
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres')
    .trim(),
  
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .trim()
    .optional(),
  
  pointsCost: z
    .number({ required_error: 'El costo en puntos es requerido' })
    .int('El costo debe ser un número entero')
    .positive('El costo debe ser mayor a 0')
    .max(1000000, 'El costo no puede exceder 1,000,000 puntos'),
  
  stock: z
    .number({ required_error: 'El stock es requerido' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .max(1000000, 'El stock no puede exceder 1,000,000 unidades'),
  
  imageUrl: z
    .string()
    .url('URL de imagen inválida')
    .max(500, 'La URL no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  
  category: z
    .enum(['Descuentos', 'Productos', 'Servicios', 'Cultura', 'Ecología', 'Salud'], {
      errorMap: () => ({ message: 'Categoría inválida' }),
    })
    .optional()
    .nullable(),
  
  active: z.boolean().optional().default(true),
});

// Esquema para actualizar beneficio
export const updateBenefitSchema = createBenefitSchema.partial();

// Esquema para crear noticia (admin)
export const createNewsSchema = z.object({
  title: z
    .string({ required_error: 'El título es requerido' })
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres')
    .trim(),
  
  body: z
    .string({ required_error: 'El cuerpo es requerido' })
    .min(10, 'El cuerpo debe tener al menos 10 caracteres')
    .max(10000, 'El cuerpo no puede exceder 10,000 caracteres')
    .trim(),
  
  imageUrl: z
    .string()
    .url('URL de imagen inválida')
    .max(500, 'La URL no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  
  published: z.boolean().optional().default(false),
});

// Esquema para actualizar noticia
export const updateNewsSchema = createNewsSchema.partial();

// Esquema para canjear beneficio
export const redeemBenefitSchema = z.object({
  benefitId: z
    .string({ required_error: 'El ID del beneficio es requerido' })
    .uuid('ID de beneficio inválido'),
});

// Esquema para agregar puntos (admin)
export const addPointsSchema = z.object({
  userId: z
    .string({ required_error: 'El ID del usuario es requerido' })
    .uuid('ID de usuario inválido'),
  
  points: z
    .number({ required_error: 'Los puntos son requeridos' })
    .int('Los puntos deben ser un número entero')
    .positive('Los puntos deben ser mayores a 0')
    .max(1000000, 'No se pueden agregar más de 1,000,000 puntos de una vez'),
  
  description: z
    .string({ required_error: 'La descripción es requerida' })
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim(),
});

// Esquema para escanear QR
export const scanQRSchema = z.object({
  qrCode: z
    .string({ required_error: 'El código QR es requerido' })
    .min(1, 'El código QR es requerido')
    .trim(),
});

// Esquema para consultas paginadas
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'La página debe ser mayor a 0'),
  
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100'),
});

/**
 * Middleware para validar datos con esquema Zod
 * @param {ZodSchema} schema - Esquema de validación Zod
 * @param {string} source - 'body' | 'query' | 'params'
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Los datos enviados no son válidos',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
