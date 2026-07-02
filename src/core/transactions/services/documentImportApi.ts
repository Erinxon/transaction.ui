import api from '../../api/axios';
import type {
  DocumentImportConfirmRequest,
  DocumentImportConfirmResponse,
  DocumentImportJobResponse,
  DocumentImportUploadResponse,
} from '../types/documentImport.types';

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: string | { message?: string } } }).response;
    if (typeof response?.data === 'string') {
      return response.data;
    }
    if (response?.data && typeof response.data === 'object' && 'message' in response.data) {
      return String(response.data.message);
    }
  }
  return 'No se pudo procesar el documento.';
};

export const uploadDocumentImport = async (file: File): Promise<DocumentImportUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/UserTransaction/import-from-document/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getDocumentImportJob = async (jobId: string): Promise<DocumentImportJobResponse> => {
  const response = await api.get(`/UserTransaction/import-from-document/jobs/${jobId}`);
  return response.data;
};

export const getActiveDocumentImportJob = async (): Promise<DocumentImportJobResponse | null> => {
  try {
    const response = await api.get('/UserTransaction/import-from-document/jobs/active');
    return response.data;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        return null;
      }
    }
    throw new Error(extractErrorMessage(error));
  }
};

export const confirmDocumentImport = async (
  request: DocumentImportConfirmRequest,
): Promise<DocumentImportConfirmResponse> => {
  try {
    const response = await api.post('/UserTransaction/import-from-document/confirm', request);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
