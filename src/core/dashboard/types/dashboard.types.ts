export interface ByYearRequest extends DashboardFilter {
    year: number;
}

export interface ByYearResponse {
    monthId: number;
    monthName: number;
    transactionType: number;
    transactionTypeName: string;
    amount: number;
}

export interface DashboardFilter {
    minAmount: number | null
    maxAmount: number | null
    dateRange: string | null;
    startDate: string | null
    endDate: string | null
    description: string | null
    transactionTypeId: number | null
    categoryId: number | null
}

export interface RecentTransactionRequest  {
    count?: number;
}

export interface RecentTransactionResponse {
    id: number;
    amount: number;
    date: Date;
    description: string;
    transactionTypeId: number;
    categoryId: number;
    category: string;
}


export interface SummaryResponse {
    income: number;
    expenses: number;
}