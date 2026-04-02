export interface TransactionRequest {
  page: number;
  pageSize: number;
  dateRange: string;
  minAmount: number | null;
  maxAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  transactionTypeId: number | null;
  categoryId: number | null;
  sortField: string | null;
  sortDirection: string | null;
}

export interface PaginatedResponse<T> {
  totalItems: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface TransactionResponse {
  id: number;
  amount: number;
  date: Date;
  description: string;
  transactionTypeId: number;
  categoryId: number;
  category: string;
}

export interface CreateTransactionRequest {
  amount: number;
  date: Date;
  description: string;
  transactionTypeId: number;
  categoryId: number;
}

export interface CreateTransactionResponse {
  id: number;
}

export interface ImportResponse {
  insertedCount: number;
  categoriesCreated: number;
}

export interface UpdateTransactionRequest {
  id: number;
  amount: number;
  date: Date;
  description: string;
  transactionTypeId: number;
  categoryId: number;
}