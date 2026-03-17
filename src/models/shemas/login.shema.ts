import {z} from 'zod';

export const loginSchema = z.object({
    email: z.string().min(1, 'El email es obligatorio').email('Correo inválido'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
    code: z.string().optional()
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginFormValueEmptyValue: LoginFormValues = {
    email: '',
    password: '',
    code: ''
}