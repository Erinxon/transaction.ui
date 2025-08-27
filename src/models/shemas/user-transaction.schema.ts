import { z } from 'zod';

export const UserTransactionSchema: z.ZodType<
    { amount: number; date: Date; description: string; transactionTypeId: number; categoryId: number },
    z.ZodTypeDef,
    { amount: number; date?: unknown; description: string; transactionTypeId: number; categoryId: number }
> = z.object({
    amount: z
        .number({ required_error: 'El monto es requerido' })
        .min(0.01, 'El monto debe ser mayor a 0'),
    date: z.union([z.string(), z.date()])
        .refine((val) => val !== undefined && val !== null && val !== '', {
            message: 'La fecha es requerida',
        })
        .transform((val) => (typeof val === 'string' ? new Date(val) : val))
        .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
            message: 'La fecha no es válida',
        }),
    description: z
        .string()
        .min(1, 'La descripción es requerida')
        .max(250, 'La descripción no puede superar los 250 caracteres')
        .refine(val => val.trim().length > 0, {
            message: 'La descripción no puede estar vacía o contener solo espacios en blanco',
        }),
    transactionTypeId: z
        .number({ required_error: 'El tipo es requerido' })
        .min(1, 'El tipo es requerido'),
    categoryId: z
        .number({ required_error: 'La categoría es requerida' })
        .min(1, 'Debe seleccionar una categoría'),
});

export type UserTransactionFormValues = z.infer<typeof UserTransactionSchema>;

export const UserTransactionFormValueEmptyValue: UserTransactionFormValues = {
    amount: 0,
    date: new Date(),
    description: '',
    transactionTypeId: 0,
    categoryId: 0
}