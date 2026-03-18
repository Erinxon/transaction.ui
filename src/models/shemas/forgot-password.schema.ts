import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Correo invalido').max(250),
});

export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordFormValuesEmptyValue: ForgotPasswordFormValues = {
  email: '',
};
