const STORAGE_KEY = 'documentImport:activeJobId';
const DISMISSED_KEY = 'documentImport:dismissedJobId';

export const getStoredDocumentImportJobId = (): string | null =>
  sessionStorage.getItem(STORAGE_KEY);

export const setStoredDocumentImportJobId = (jobId: string | null): void => {
  if (jobId) {
    sessionStorage.setItem(STORAGE_KEY, jobId);
    return;
  }
  sessionStorage.removeItem(STORAGE_KEY);
};

export const getDismissedDocumentImportJobId = (): string | null =>
  sessionStorage.getItem(DISMISSED_KEY);

export const setDismissedDocumentImportJobId = (jobId: string | null): void => {
  if (jobId) {
    sessionStorage.setItem(DISMISSED_KEY, jobId);
    return;
  }
  sessionStorage.removeItem(DISMISSED_KEY);
};
