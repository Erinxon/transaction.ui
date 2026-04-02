import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { DashboardFilter } from "../../../core/dashboard/types/dashboard.types";
import { getAllCategories } from "../../../core/Category/services/categoryApi";
import { TransactionType } from "../../../core/Category/types/category.types";
import {
    deleteTransaction,
    downloadTransactionsTemplate,
    exportTransactions,
    getAllTransactions,
    importTransactions,
} from "../../../core/transactions/services/transactionApi";
import type { ImportResponse, TransactionRequest, TransactionResponse } from "../../../core/transactions/types/transaction.types";
import { AdvancedFilterModal } from "../../../components/AdvancedFilterModal";
import { Alert, ConfirmDialog, Modal, NotSort } from "../../../components";
import { useModalContext } from "../../../components/Modal/context";
import FormattedNumber from "../../../components/FormattedNumber";
import Pagination from "../../../components/Pagination";
import { SkeletonRow } from "../../../components/SkeletonRow";
import { AddTransaction } from "./components/AddTransaction";

const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const getImportSuccessMessage = ({ insertedCount, categoriesCreated }: ImportResponse) => {
    const transactionLabel = insertedCount === 1 ? "transaccion importada" : "transacciones importadas";
    const categoryLabel = categoriesCreated === 1 ? "categoria creada" : "categorias creadas";

    return `Importacion completada: ${insertedCount} ${transactionLabel} y ${categoriesCreated} ${categoryLabel}.`;
};

export const Transactions = () => {
    const queryClient = useQueryClient();
    const { setIsOpen } = useModalContext();
    const importInputRef = useRef<HTMLInputElement | null>(null);

    const [currentModal, setCurrentModal] = useState<"add" | "filter" | "delete">("add");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [transactionResponse, setTransactionResponse] = useState<TransactionResponse | null>(null);
    const [sortField, setSortField] = useState("Date");
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("descending");
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [filters, setFilters] = useState<DashboardFilter>({
        minAmount: null,
        maxAmount: null,
        dateRange: "all",
        startDate: null,
        endDate: null,
        description: null,
        transactionTypeId: null,
        categoryId: null,
    });

    const { isLoading, error, data } = useQuery({
        queryKey: ["allTransactions", { ...filters, page, pageSize: perPage, sortField, sortDirection }],
        queryFn: ({ queryKey }) => getAllTransactions(queryKey[1] as TransactionRequest),
    });

    const { mutate: mutateDelete } = useMutation({
        mutationFn: deleteTransaction,
    });

    const { mutate: mutateImport, isPending: isImporting } = useMutation({
        mutationFn: importTransactions,
        onSuccess: (response) => {
            setErrorMessage("");
            setFeedbackMessage(getImportSuccessMessage(response));
            reload();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "No se pudo importar el archivo Excel.";
            setFeedbackMessage("");
            setErrorMessage(message);
        },
    });

    const { mutate: mutateExport, isPending: isExporting } = useMutation({
        mutationFn: exportTransactions,
        onSuccess: (blob) => {
            triggerDownload(blob, "transacciones_export.xlsx");
            setErrorMessage("");
            setFeedbackMessage("Exportacion completada. Se descargo el archivo Excel de transacciones.");
        },
        onError: () => {
            setFeedbackMessage("");
            setErrorMessage("No se pudo exportar el archivo Excel de transacciones.");
        },
    });

    const { mutate: mutateTemplateDownload, isPending: isDownloadingTemplate } = useMutation({
        mutationFn: downloadTransactionsTemplate,
        onSuccess: (blob) => {
            triggerDownload(blob, "plantilla_transacciones.xlsx");
            setErrorMessage("");
            setFeedbackMessage("Plantilla descargada. Puedes completarla y luego importarla en esta pantalla.");
        },
        onError: () => {
            setFeedbackMessage("");
            setErrorMessage("No se pudo descargar la plantilla de transacciones.");
        },
    });

    const selectedTransactionType = filters.transactionTypeId ? Number(filters.transactionTypeId) : null;

    const { data: categories } = useQuery({
        queryKey: ["allCategories", selectedTransactionType],
        queryFn: () => getAllCategories(
            selectedTransactionType ? selectedTransactionType as TransactionType : undefined,
        ),
    });

    useEffect(() => {
        if (!filters.categoryId) {
            return;
        }

        const categoryId = Number(filters.categoryId);
        const isValidCategory = categories?.some((category) => category.id === categoryId) ?? false;
        if (!isValidCategory) {
            setFilters((prev) => ({
                ...prev,
                categoryId: null,
            }));
        }
    }, [categories, filters.categoryId]);

    const reload = () => {
        queryClient.invalidateQueries({
            queryKey: ["allTransactions"],
            exact: false,
        });
    };

    const handleFiltersChange = (newFilters: DashboardFilter) => {
        setFilters(newFilters);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "ascending" ? "descending" : "ascending"));
        } else {
            setSortField(field);
            setSortDirection("ascending");
        }
    };

    const handleShowModal = (modal: "add" | "filter" | "delete") => {
        setCurrentModal(modal);
        setIsOpen(true);
    };

    const handleAdd = () => {
        setTransactionResponse(null);
        handleShowModal("add");
    };

    const handleOnSuccess = () => {
        reload();
        setIsOpen(false);
        setTransactionResponse(null);
    };

    const handleEdit = (transaction: TransactionResponse) => {
        setTransactionResponse(transaction);
        handleShowModal("add");
    };

    const handleDelete = (transaction: TransactionResponse) => {
        setTransactionResponse(transaction);
        handleShowModal("delete");
    };

    const handleConfirmDelete = () => {
        if (transactionResponse?.id) {
            mutateDelete(transactionResponse.id, {
                onSuccess: () => {
                    reload();
                    setIsOpen(false);
                },
            });
        }
    };

    const handleInputChange = (name: keyof DashboardFilter, value: string | number | null) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value === "" ? null : value,
        }));
    };

    const handleExport = () => {
        mutateExport();
    };

    const handleTemplateDownload = () => {
        mutateTemplateDownload();
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith(".xlsx")) {
            setFeedbackMessage("");
            setErrorMessage("El archivo debe ser un Excel (.xlsx).");
            event.target.value = "";
            return;
        }

        mutateImport(file);
        event.target.value = "";
    };

    return (
        <>
            <section className="app-page fade-in-up">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="page-title">Transactions</h1>
                        <p className="page-subtitle">Registra, filtra y ordena tus movimientos de forma rapida.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={handleAdd} className="btn-modern btn-primary">
                            <i className="fas fa-plus mr-2"></i> Nuevo movimiento
                        </button>
                        <button className="btn-modern btn-secondary" onClick={handleTemplateDownload} disabled={isDownloadingTemplate}>
                            <i className="fas fa-file-arrow-down mr-2"></i> {isDownloadingTemplate ? "Descargando..." : "Plantilla Excel"}
                        </button>
                        <button className="btn-modern btn-secondary" onClick={handleExport} disabled={isExporting}>
                            <i className="fas fa-file-export mr-2"></i> {isExporting ? "Exportando..." : "Exportar Excel"}
                        </button>
                        <button className="btn-modern btn-secondary" onClick={handleImportClick} disabled={isImporting}>
                            <i className="fas fa-file-import mr-2"></i> {isImporting ? "Importando..." : "Importar Excel"}
                        </button>
                        <input ref={importInputRef} type="file" accept=".xlsx" className="hidden" onChange={handleImportFile} disabled={isImporting} />
                    </div>
                </div>

                {feedbackMessage && <Alert type="success" message={feedbackMessage} className="mb-4" onClose={() => setFeedbackMessage("")} />}
                {errorMessage && <Alert type="error" message={errorMessage} className="mb-4" onClose={() => setErrorMessage("")} />}

                <div className="soft-card mb-4 rounded-2xl p-4">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="grid w-full grid-cols-1 gap-3 md:w-auto md:grid-cols-2">
                            <div>
                                <label htmlFor="transaction-type" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Tipo
                                </label>
                                <select
                                    id="transaction-type"
                                    className="select-modern"
                                    value={filters.transactionTypeId || ""}
                                    onChange={(e) => handleInputChange("transactionTypeId", e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option value="">Todo</option>
                                    <option value={1}>Ingreso</option>
                                    <option value={2}>Gasto</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="category" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Categoria
                                </label>
                                <select
                                    id="category"
                                    className="select-modern"
                                    value={filters.categoryId || ""}
                                    onChange={(e) => handleInputChange("categoryId", e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option key={0} value="">
                                        Todo
                                    </option>
                                    {categories?.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button id="advanced-filter-toggle" className="btn-modern btn-ghost" onClick={() => handleShowModal("filter")}>
                            <i className="fas fa-sliders mr-2"></i> Filtros avanzados
                        </button>
                    </div>
                </div>

                <div id="list-view" className="soft-card overflow-hidden rounded-2xl">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("Date")} className="cursor-pointer text-left">
                                    Date {sortField === "Date" && (sortDirection === "ascending" ? "▲" : "▼")}
                                    {sortField !== "Date" && <NotSort />}
                                </th>
                                <th onClick={() => handleSort("Category")} className="cursor-pointer text-left">
                                    Category {sortField === "Category" && (sortDirection === "ascending" ? "▲" : "▼")}
                                    {sortField !== "Category" && <NotSort />}
                                </th>
                                <th className="text-left">Comment</th>
                                <th onClick={() => handleSort("Amount")} className="cursor-pointer text-right">
                                    Amount {sortField === "Amount" && (sortDirection === "ascending" ? "▲" : "▼")}
                                    {sortField !== "Amount" && <NotSort />}
                                </th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <SkeletonRow quantity={5} />
                            ) : error ? (
                                <tr>
                                    <td className="text-center text-red-500" colSpan={5}>
                                        <Alert type="error" message="Error cargando transacciones" />
                                    </td>
                                </tr>
                            ) : (
                                (data?.items ?? []).map((item) => (
                                    <tr key={item.id}>
                                        <td className="whitespace-nowrap text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="whitespace-nowrap text-sm">
                                            <span className={`status-chip ${item.transactionTypeId === 1 ? "status-income" : "status-expense"}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="max-w-48 truncate whitespace-nowrap text-sm text-gray-600">{item.description}</td>
                                        <td
                                            className={`whitespace-nowrap text-right text-sm font-semibold ${
                                                item.transactionTypeId === 1 ? "text-emerald-700" : "text-rose-700"
                                            }`}
                                        >
                                            <FormattedNumber value={item.amount} isAmount={true} />
                                        </td>
                                        <td className="whitespace-nowrap text-right text-sm font-medium">
                                            <button className="mr-3 cursor-pointer text-emerald-700 hover:text-emerald-900" onClick={() => handleEdit(item)}>
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="cursor-pointer text-rose-700 hover:text-rose-900" onClick={() => handleDelete(item)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <Pagination
                        currentPage={page}
                        totalItems={data?.totalItems ?? 0}
                        itemsPerPage={perPage}
                        onPageChange={(newPage: number) => setPage(newPage)}
                        onItemsPerPageChange={(items: number) => setPerPage(items)}
                        perPageOptions={[5, 10, 20, 50, 100]}
                    />
                </div>
            </section>

            {currentModal === "add" && (
                <Modal title={`${transactionResponse?.id ? "Edit" : "Add"} Transaction`} disableClickOutside={true}>
                    <AddTransaction data={transactionResponse} onSuccess={handleOnSuccess} />
                </Modal>
            )}

            {currentModal === "filter" && <AdvancedFilterModal filters={filters} onFiltersChange={handleFiltersChange} />}

            {currentModal === "delete" && (
                <ConfirmDialog
                    title="Eliminar elemento"
                    description="Estas seguro de que quieres eliminar este elemento?"
                    onConfirm={handleConfirmDelete}
                    confirmText="Si, eliminar"
                    cancelText="Cancelar"
                />
            )}
        </>
    );
};
