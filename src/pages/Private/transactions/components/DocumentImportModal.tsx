import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal } from "../../../../components";
import FormattedNumber from "../../../../components/FormattedNumber";
import { useModalContext } from "../../../../components/Modal/context";
import { getAllCategories } from "../../../../core/Category/services/categoryApi";
import {
    confirmDocumentImport,
    getActiveDocumentImportJob,
    getDocumentImportJob,
    uploadDocumentImport,
} from "../../../../core/transactions/services/documentImportApi";
import {
    getDismissedDocumentImportJobId,
    getStoredDocumentImportJobId,
    setDismissedDocumentImportJobId,
    setStoredDocumentImportJobId,
} from "../../../../core/transactions/services/documentImportSession";
import type { DocumentImportJobResponse, DocumentImportJobStatus, ExtractedTransactionRow } from "../../../../core/transactions/types/documentImport.types";
import { useI18n } from "../../../../core/i18n/useI18n";

interface Props {
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

type ConfirmStep = null | "upload" | "cancel-analysis" | "confirm-import";

const formatElapsed = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const countNewCategories = (rows: ExtractedTransactionRow[], existingNames: Set<string>) => {
    const pending = new Set<string>();
    for (const row of rows) {
        const name = row.category.trim().toLowerCase();
        if (!name || existingNames.has(name) || pending.has(name)) {
            continue;
        }
        pending.add(name);
    }
    return pending.size;
};

const formatDateForInput = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value.slice(0, 10);
    }
    return date.toISOString().slice(0, 10);
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isPollingStatus = (status: DocumentImportJobStatus | null) =>
    status === "Pending" || status === "Processing";

const mapJobToRows = (transactions: ExtractedTransactionRow[]) =>
    transactions.map((row) => ({
        ...row,
        date: formatDateForInput(row.date),
        transactionType: row.transactionType === "Income" ? "Income" : "Expense",
    }));

const applyJobResponse = (
    job: DocumentImportJobResponse,
    setJobStatus: (status: DocumentImportJobStatus) => void,
    setRows: (rows: ExtractedTransactionRow[]) => void,
    setWarnings: (warnings: string | null) => void,
    setLocalError: (error: string) => void,
    clearJob: () => void,
) => {
    setJobStatus(job.status);

    if (job.status === "Completed" && job.transactions) {
        setRows(mapJobToRows(job.transactions));
        setWarnings(job.warnings);
        setLocalError("");
        return;
    }

    if (job.status === "Failed") {
        setLocalError(job.errorMessage ?? "No se pudo analizar el documento.");
        clearJob();
        return;
    }

    if (job.status === "Imported") {
        clearJob();
    }
};

export const DocumentImportModal = ({ onSuccess, onError }: Props) => {
    const { setIsOpen } = useModalContext();
    const { t } = useI18n();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<DocumentImportJobStatus | null>(null);
    const [rows, setRows] = useState<ExtractedTransactionRow[]>([]);
    const [warnings, setWarnings] = useState<string | null>(null);
    const [localError, setLocalError] = useState("");
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [confirmStep, setConfirmStep] = useState<ConfirmStep>(null);
    const [uploadPhase, setUploadPhase] = useState(false);
    const [isRestoring, setIsRestoring] = useState(true);
    const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const analysisStartedAtRef = useRef<number | null>(null);

    const clearJob = () => {
        setStoredDocumentImportJobId(null);
        setJobId(null);
        setJobStatus(null);
        setRows([]);
        setWarnings(null);
    };

    const resetJobState = () => {
        clearJob();
        setLocalError("");
    };

    const resetState = () => {
        resetJobState();
        setPendingFile(null);
        setConfirmStep(null);
        setUploadPhase(false);
    };

    useEffect(() => {
        let cancelled = false;

        const restoreJob = async () => {
            try {
                const storedId = getStoredDocumentImportJobId();
                let job: DocumentImportJobResponse | null = null;

                if (storedId) {
                    job = await getDocumentImportJob(storedId);
                } else {
                    job = await getActiveDocumentImportJob();
                }

                if (cancelled || !job) {
                    return;
                }

                if (job.jobId === getDismissedDocumentImportJobId()) {
                    return;
                }

                if (job.status === "Imported" || job.status === "Failed") {
                    if (job.status === "Failed") {
                        setLocalError(job.errorMessage ?? "No se pudo analizar el documento.");
                    }
                    setStoredDocumentImportJobId(null);
                    return;
                }

                setStoredDocumentImportJobId(job.jobId);
                setJobId(job.jobId);
                applyJobResponse(job, setJobStatus, setRows, setWarnings, setLocalError, clearJob);
            } catch {
                if (!cancelled) {
                    setStoredDocumentImportJobId(null);
                }
            } finally {
                if (!cancelled) {
                    setIsRestoring(false);
                }
            }
        };

        restoreJob();

        return () => {
            cancelled = true;
        };
    }, []);

    const { data: categories } = useQuery({
        queryKey: ["allCategories", "document-import"],
        queryFn: () => getAllCategories(),
    });

    const existingCategoryNames = useMemo(
        () => new Set((categories ?? []).map((c) => c.name.trim().toLowerCase())),
        [categories],
    );

    const previewSummary = useMemo(() => {
        let incomeTotal = 0;
        let expenseTotal = 0;

        for (const row of rows) {
            if (row.transactionType === "Income") {
                incomeTotal += row.amount;
            } else {
                expenseTotal += row.amount;
            }
        }

        return {
            count: rows.length,
            incomeTotal,
            expenseTotal,
            newCategoriesCount: countNewCategories(rows, existingCategoryNames),
        };
    }, [rows, existingCategoryNames]);

    const { mutate: upload, isPending: isUploading } = useMutation({
        mutationFn: uploadDocumentImport,
        onSuccess: (response) => {
            setUploadPhase(false);
            setDismissedDocumentImportJobId(null);
            setJobId(response.jobId);
            setJobStatus(response.status);
            setStoredDocumentImportJobId(response.jobId);
            setLocalError("");
            setPendingFile(null);
            setConfirmStep(null);
        },
        onError: (error: Error) => {
            setUploadPhase(false);
            setLocalError(error.message);
        },
    });

    const isAnalyzing = uploadPhase || isUploading || isPollingStatus(jobStatus);

    const { data: jobData } = useQuery({
        queryKey: ["documentImportJob", jobId],
        queryFn: () => getDocumentImportJob(jobId!),
        enabled: !!jobId,
        refetchInterval: (query) => {
            const status = query.state.data?.status ?? jobStatus;
            return status === "Pending" || status === "Processing" ? 2000 : false;
        },
    });

    useEffect(() => {
        if (!jobData) {
            return;
        }

        applyJobResponse(jobData, setJobStatus, setRows, setWarnings, setLocalError, clearJob);
    }, [jobData]);

    useEffect(() => {
        if (!isAnalyzing) {
            analysisStartedAtRef.current = null;
            setAnalysisStartedAt(null);
            setElapsedSeconds(0);
            return;
        }

        if (!analysisStartedAtRef.current) {
            const startedAt = jobData?.startedAt
                ? new Date(jobData.startedAt).getTime()
                : jobData?.createdAt
                    ? new Date(jobData.createdAt).getTime()
                    : Date.now();
            analysisStartedAtRef.current = startedAt;
            setAnalysisStartedAt(startedAt);
        }
    }, [isAnalyzing, jobData?.createdAt, jobData?.startedAt]);

    useEffect(() => {
        if (!isAnalyzing || !analysisStartedAt) {
            return;
        }

        const tick = () => {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - analysisStartedAt) / 1000)));
        };

        tick();
        const intervalId = window.setInterval(tick, 1000);
        return () => window.clearInterval(intervalId);
    }, [isAnalyzing, analysisStartedAt]);

    const { mutate: confirm, isPending: isConfirming } = useMutation({
        mutationFn: confirmDocumentImport,
        onSuccess: (response) => {
            const txLabel = response.insertedCount === 1 ? "transacción" : "transacciones";
            const catLabel = response.categoriesCreated === 1 ? "categoría" : "categorías";
            onSuccess(`Importación completada: ${response.insertedCount} ${txLabel} y ${response.categoriesCreated} ${catLabel}.`);
            resetState();
            setIsOpen(false);
        },
        onError: (error: Error) => {
            onError(error.message);
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || uploadPhase || isUploading || isPollingStatus(jobStatus) || jobId) {
            return;
        }
        resetJobState();
        setPendingFile(file);
        setConfirmStep("upload");
    };

    const handleConfirmUpload = () => {
        if (!pendingFile) {
            return;
        }
        const file = pendingFile;
        setUploadPhase(true);
        setConfirmStep(null);
        setPendingFile(null);
        setLocalError("");
        upload(file);
    };

    const handleCancelUploadConfirm = () => {
        setPendingFile(null);
        setConfirmStep(null);
    };

    const handleRowChange = (index: number, field: keyof ExtractedTransactionRow, value: string | number) => {
        setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    const hasActiveJob = !!jobId || uploadPhase || isUploading;
    const showPreview = jobStatus === "Completed" && rows.length > 0;
    const showFilePicker = !isRestoring && !hasActiveJob && confirmStep !== "upload";
    const lockModal = isConfirming || confirmStep !== null;

    const analyzingMessage = uploadPhase || isUploading
        ? t("tx_doc_import_uploading")
        : jobStatus === "Processing"
            ? t("tx_doc_import_analyzing")
            : t("tx_doc_import_queued");

    const handleRequestConfirmImport = () => {
        if (!jobId || rows.length === 0) {
            return;
        }
        setConfirmStep("confirm-import");
    };

    const handleConfirmImport = () => {
        if (!jobId || rows.length === 0) {
            return;
        }
        confirm({ sessionId: jobId, transactions: rows });
    };

    const handleDismiss = () => {
        if (confirmStep === "upload") {
            handleCancelUploadConfirm();
            return;
        }
        if (confirmStep === "confirm-import" || confirmStep === "cancel-analysis") {
            setConfirmStep(null);
            return;
        }
        setConfirmStep(null);
        setIsOpen(false);
    };

    const handleCancelOperation = () => {
        if (isAnalyzing || showPreview) {
            setConfirmStep("cancel-analysis");
            return;
        }
        if (jobId) {
            setDismissedDocumentImportJobId(jobId);
        }
        resetState();
        setIsOpen(false);
    };

    const handleConfirmCancelAnalysis = () => {
        if (jobId) {
            setDismissedDocumentImportJobId(jobId);
        }
        resetState();
        setIsOpen(false);
    };

    return (
        <Modal
            title={t("tx_doc_import_title")}
            description={t("tx_doc_import_desc")}
            disableClickOutside={lockModal}
            onRequestClose={handleDismiss}
            panelClassName="max-w-5xl"
        >
            <div className="space-y-4">
                {isRestoring && (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-700">
                        <i className="fas fa-spinner fa-spin text-gray-500"></i>
                        <p className="font-medium">{t("tx_doc_import_restoring")}</p>
                    </div>
                )}

                {!isRestoring && confirmStep === "upload" && pendingFile && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">{t("tx_doc_import_confirm_upload_title")}</p>
                                <p className="text-sm text-gray-600">{t("tx_doc_import_confirm_upload_desc")}</p>
                            </div>
                        </div>
                        <div className="rounded-lg border border-amber-100 bg-white/80 px-3 py-2 text-sm text-gray-700">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("tx_doc_import_selected_file")}</p>
                            <p className="mt-1 font-medium break-all">{pendingFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(pendingFile.size)} · {pendingFile.type || "—"}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="btn-modern btn-secondary"
                                onClick={handleCancelUploadConfirm}
                                disabled={isUploading || uploadPhase}
                            >
                                {t("tx_doc_import_confirm_upload_back")}
                            </button>
                            <button
                                type="button"
                                className="btn-modern btn-primary"
                                onClick={handleConfirmUpload}
                                disabled={isUploading || uploadPhase}
                            >
                                {isUploading || uploadPhase ? t("tx_doc_import_uploading") : t("tx_doc_import_confirm_upload_action")}
                            </button>
                        </div>
                    </div>
                )}

                {showFilePicker && (
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            className="btn-modern btn-secondary w-full justify-center"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || uploadPhase}
                        >
                            <i className="fas fa-file-upload mr-2"></i>
                            {t("tx_doc_import_select")}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf,.md,image/jpeg,image/png,image/webp,application/pdf,text/markdown"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )}

                {!isRestoring && isAnalyzing && confirmStep !== "cancel-analysis" && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
                        <i className="fas fa-spinner fa-spin text-emerald-700"></i>
                        <div>
                            <p className="font-medium">{analyzingMessage}</p>
                            <p className="mt-0.5 text-xs text-emerald-800/80">{t("tx_doc_import_analyze_time_hint")}</p>
                            <p className="mt-0.5 text-xs text-emerald-800/80">{t("tx_doc_import_background_hint")}</p>
                            {elapsedSeconds > 0 && (
                                <p className="mt-1 text-xs font-medium text-emerald-900/90">
                                    {t("tx_doc_import_elapsed", { elapsed: formatElapsed(elapsedSeconds) })}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {confirmStep === "cancel-analysis" && (
                    <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">{t("tx_doc_import_confirm_cancel_title")}</p>
                                <p className="text-sm text-gray-600">{t("tx_doc_import_confirm_cancel_desc")}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="btn-modern btn-secondary"
                                onClick={() => setConfirmStep(null)}
                            >
                                {t("tx_doc_import_confirm_cancel_back")}
                            </button>
                            <button
                                type="button"
                                className="btn-modern bg-red-600 text-white hover:bg-red-700"
                                onClick={handleConfirmCancelAnalysis}
                            >
                                {t("tx_doc_import_confirm_cancel_action")}
                            </button>
                        </div>
                    </div>
                )}

                {confirmStep === "confirm-import" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-900">
                                    {t("tx_doc_import_confirm_import_title", { count: previewSummary.count })}
                                </p>
                                <p className="text-sm text-gray-600">{t("tx_doc_import_confirm_import_desc")}</p>
                                {previewSummary.newCategoriesCount > 0 && (
                                    <p className="text-sm text-gray-600">
                                        {t("tx_doc_import_confirm_import_new_categories", { count: previewSummary.newCategoriesCount })}
                                    </p>
                                )}
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>
                                        {t("tx_doc_import_summary_income")}: <FormattedNumber value={previewSummary.incomeTotal} isAmount />
                                    </li>
                                    <li>
                                        {t("tx_doc_import_summary_expense")}: <FormattedNumber value={previewSummary.expenseTotal} isAmount />
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="btn-modern btn-secondary"
                                onClick={() => setConfirmStep(null)}
                                disabled={isConfirming}
                            >
                                {t("tx_doc_import_confirm_import_back")}
                            </button>
                            <button
                                type="button"
                                className="btn-modern btn-primary"
                                onClick={handleConfirmImport}
                                disabled={isConfirming}
                            >
                                {isConfirming ? t("tx_importing") : t("tx_doc_import_confirm_import_action")}
                            </button>
                        </div>
                    </div>
                )}

                {localError && <Alert type="error" message={localError} onClose={() => setLocalError("")} />}

                {warnings && showPreview && confirmStep !== "confirm-import" && (
                    <Alert type="warning" message={`${t("tx_doc_import_warnings")}: ${warnings}`} />
                )}

                {showPreview && confirmStep !== "confirm-import" && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-900">{t("tx_doc_import_summary_title")}</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-gray-700">
                            <p>{t("tx_doc_import_summary_count", { count: previewSummary.count })}</p>
                            <p>
                                {t("tx_doc_import_summary_income")}: <FormattedNumber value={previewSummary.incomeTotal} isAmount />
                            </p>
                            <p>
                                {t("tx_doc_import_summary_expense")}: <FormattedNumber value={previewSummary.expenseTotal} isAmount />
                            </p>
                            <p>
                                {previewSummary.newCategoriesCount > 0
                                    ? t("tx_doc_import_summary_new_categories", { count: previewSummary.newCategoriesCount })
                                    : t("tx_doc_import_summary_no_new_categories")}
                            </p>
                        </div>
                    </div>
                )}

                {showPreview && confirmStep !== "confirm-import" && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-2 py-2">{t("tx_doc_col_amount")}</th>
                                    <th className="px-2 py-2">{t("tx_doc_col_date")}</th>
                                    <th className="px-2 py-2">{t("tx_doc_col_description")}</th>
                                    <th className="px-2 py-2">{t("tx_doc_col_type")}</th>
                                    <th className="px-2 py-2">{t("tx_doc_col_category")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index} className="border-t border-gray-100">
                                        <td className="px-2 py-1">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-20 rounded border border-gray-200 px-2 py-1"
                                                value={row.amount}
                                                onChange={(e) => handleRowChange(index, "amount", Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input
                                                type="date"
                                                className="rounded border border-gray-200 px-2 py-1"
                                                value={row.date}
                                                onChange={(e) => handleRowChange(index, "date", e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-1 min-w-[12rem]">
                                            <input
                                                type="text"
                                                className="w-full min-w-0 rounded border border-gray-200 px-2 py-1"
                                                value={row.description}
                                                onChange={(e) => handleRowChange(index, "description", e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <select
                                                className="rounded border border-gray-200 px-2 py-1"
                                                value={row.transactionType}
                                                onChange={(e) => handleRowChange(index, "transactionType", e.target.value)}
                                            >
                                                <option value="Income">{t("tx_doc_type_income")}</option>
                                                <option value="Expense">{t("tx_doc_type_expense")}</option>
                                            </select>
                                        </td>
                                        <td className="px-2 py-1">
                                            <input
                                                type="text"
                                                className="min-w-[100px] rounded border border-gray-200 px-2 py-1"
                                                value={row.category}
                                                onChange={(e) => handleRowChange(index, "category", e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {confirmStep !== "upload" && confirmStep !== "cancel-analysis" && confirmStep !== "confirm-import" && (
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" className="btn-modern btn-secondary" onClick={handleCancelOperation} disabled={isConfirming}>
                            {t("tx_doc_import_cancel")}
                        </button>
                        {showPreview && (
                            <>
                                <button
                                    type="button"
                                    className="btn-modern btn-ghost"
                                    onClick={() => {
                                        if (jobId) {
                                            setDismissedDocumentImportJobId(jobId);
                                        }
                                        resetState();
                                        fileInputRef.current?.click();
                                    }}
                                    disabled={isConfirming}
                                >
                                    {t("tx_doc_import_back")}
                                </button>
                                <button
                                    type="button"
                                    className="btn-modern btn-primary"
                                    onClick={handleRequestConfirmImport}
                                    disabled={isConfirming || rows.length === 0}
                                >
                                    {t("tx_doc_import_confirm")}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
