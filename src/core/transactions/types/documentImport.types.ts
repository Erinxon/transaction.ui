import type { ImportResponse } from './transaction.types';

export type DocumentImportJobStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Imported'
  | 'Expired';

export interface DocumentImportUploadResponse {
  jobId: string;
  status: DocumentImportJobStatus;
}

export interface DocumentImportJobResponse {
  jobId: string;
  status: DocumentImportJobStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  warnings: string | null;
  errorMessage: string | null;
  transactions: ExtractedTransactionRow[] | null;
}

export interface DocumentImportConfirmRequest {
  sessionId: string;
  transactions?: ExtractedTransactionRow[];
}

export type DocumentImportConfirmResponse = ImportResponse;

export interface ExtractedTransactionRow {
  amount: number;
  date: string;
  description: string;
  transactionType: string;
  category: string;
}
