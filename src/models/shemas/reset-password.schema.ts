import { z } from 'zod';

export const ResetPasswordSchema = z
  .object({
    email: z.string().min(1, 'El email es obligatorio').email('Correo invalido').max(250),
    newPassword: z
      .string()
      .min(1, 'La nueva contrasena es obligatoria')
      .max(250, 'No debe exceder los 250 caracteres')
      .refine((value) => /[A-Z]/.test(value), {
        message: 'La contrasena debe tener al menos una letra mayuscula (A-Z)',
      })
      .refine((value) => /\d/.test(value), {
        message: 'La contrasena debe tener al menos un numero (0-9)',
      })
      .refine((value) => /[^a-zA-Z0-9]/.test(value), {
        message: 'La contrasena debe tener al menos un caracter no alfanumerico',
      }),
    confirmPassword: z
      .string()
      .min(1, 'La confirmacion de contrasena es obligatoria')
      .max(250, 'No debe exceder los 250 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contrasenas no son iguales',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

export const ResetPasswordFormValuesEmptyValue: ResetPasswordFormValues = {
  email: '',
  newPassword: '',
  confirmPassword: '',
};
