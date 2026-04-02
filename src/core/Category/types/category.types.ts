export const TransactionType = {
    Income: 1,
    Expenses: 2,
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
    [TransactionType.Income]: 'Ingreso',
    [TransactionType.Expenses]: 'Gasto',
};

export const TRANSACTION_TYPE_BADGE_CLASSES: Record<TransactionType, string> = {
    [TransactionType.Income]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [TransactionType.Expenses]: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const TRANSACTION_TYPE_OPTIONS = [
    { id: TransactionType.Income, label: 'Ingreso' },
    { id: TransactionType.Expenses, label: 'Gasto' },
] as const;

export interface CategoryResponse {
    id: number;
    name: string;
    description: string;
    transactionTypeId: TransactionType;
}