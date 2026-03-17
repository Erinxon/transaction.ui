import { z } from 'zod';

export const UpdateProfileSchema = z.object({
    firstName: z.string().min(1, 'El nombre es obligatorio').max(100),
    lastName: z.string().min(1, 'El apellido es obligatorio').max(100),
    email: z.string().min(1, 'El email es obligatorio').email('Correo inválido').max(250),
    phoneNumber: z.string().max(10, 'No debe exceder los 10 caracteres').nullable(),
    twoFactorEnabled: z.boolean().optional(),
    receiveEmailNotifications: z.boolean().optional(),
    receiveMonthlyExpenseReport: z.boolean().optional(),
    receiveWeeklyExpenseReport: z.boolean().optional(),
    receiveBiweeklyExpenseReport: z.boolean().optional(),
    sendWeeklyTransactionBackup: z.boolean().optional(),
    currentPassword: z.string().max(250, 'No debe exceder los 250 caracteres').optional(),
    password: z
        .string()
        .max(250, 'No debe exceder los 250 caracteres')
        .optional()
        .refine(val => !val || /[A-Z]/.test(val), {
            message: 'La contraseña debe tener al menos una letra mayúscula (A-Z)',
        })
        .refine(val => !val || /\d/.test(val), {
            message: 'La contraseña debe tener al menos un número (0-9)',
        })
        .refine(val => !val || /[^a-zA-Z0-9]/.test(val), {
            message: 'La contraseña debe tener al menos un carácter no alfanumérico',
        }),
    confirmPassword: z.string().max(250, 'No debe exceder los 250 caracteres').optional()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no son iguales',
    path: ['confirmPassword']
});


export type UpdateProfileSchemaFormValues = z.infer<typeof UpdateProfileSchema>;

export const UpdateProfileSchemaFormValuesEmptyValue: UpdateProfileSchemaFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    twoFactorEnabled: false,
    currentPassword: '',
    password: '',
    confirmPassword: ''
}