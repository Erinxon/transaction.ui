import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
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
    type ViewMode = "list" | "grid" | "calendar";

    const queryClient = useQueryClient();
    const { setIsOpen } = useModalContext();
    const importInputRef = useRef<HTMLInputElement | null>(null);

    const [currentModal, setCurrentModal] = useState<"add" | "filter" | "delete" | "calendar-day">("add");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [transactionResponse, setTransactionResponse] = useState<TransactionResponse | null>(null);
    const [sortField, setSortField] = useState("Date");
    const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("descending");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [calendarCursor, setCalendarCursor] = useState<Date>(new Date());
    const [selectedCalendarDayKey, setSelectedCalendarDayKey] = useState("");
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

    const formatDateToApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const isCalendarView = viewMode === "calendar";
    const monthStart = useMemo(() => new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1), [calendarCursor]);
    const monthEnd = useMemo(() => new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0), [calendarCursor]);

    const requestParams = useMemo<TransactionRequest>(() => {
        if (isCalendarView) {
            return {
                ...filters,
                page: 1,
                pageSize: 500,
                sortField,
                sortDirection,
                dateRange: "date_range",
                startDate: formatDateToApi(monthStart),
                endDate: formatDateToApi(monthEnd),
            };
        }

        return {
            ...filters,
            page,
            pageSize: perPage,
            sortField,
            sortDirection,
            dateRange: filters.dateRange ?? "all",
        };
    }, [filters, isCalendarView, monthEnd, monthStart, page, perPage, sortDirection, sortField]);

    const { isLoading, error, data } = useQuery({
        queryKey: ["allTransactions", requestParams],
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

    const transactions = data?.items ?? [];

    const weekDays = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

    const getDayKey = (dateValue: Date | string) => {
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const calendarTransactions = useMemo(() => {
        return transactions.reduce<Record<string, TransactionResponse[]>>((accumulator, item) => {
            const key = getDayKey(item.date);
            if (!key) {
                return accumulator;
            }

            if (!accumulator[key]) {
                accumulator[key] = [];
            }

            accumulator[key].push(item);
            return accumulator;
        }, {});
    }, [transactions]);

    const calendarMonthLabel = useMemo(() => {
        return calendarCursor.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    }, [calendarCursor]);

    const calendarCells = useMemo(() => {
        const year = calendarCursor.getFullYear();
        const month = calendarCursor.getMonth();
        const firstDay = new Date(year, month, 1);
        const startOffset = firstDay.getDay();
        const startDate = new Date(year, month, 1 - startOffset);

        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);

            const key = getDayKey(date);
            const dayTransactions = key ? (calendarTransactions[key] ?? []) : [];

            return {
                date,
                key,
                isCurrentMonth: date.getMonth() === month,
                dayTransactions,
            };
        });
    }, [calendarCursor, calendarTransactions]);

    const handleCalendarShift = (step: number) => {
        setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + step, 1));
    };

    const handleOpenCalendarDayModal = (dayKey: string) => {
        setSelectedCalendarDayKey(dayKey);
        setCurrentModal("calendar-day");
        setIsOpen(true);
    };

    const selectedCalendarDate = useMemo(() => {
        if (!selectedCalendarDayKey) {
            return new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
        }

        const parsed = new Date(selectedCalendarDayKey);
        if (Number.isNaN(parsed.getTime())) {
            return new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
        }

        return parsed;
    }, [calendarCursor, selectedCalendarDayKey]);

    const selectedCalendarItems = useMemo(() => {
        return calendarTransactions[selectedCalendarDayKey] ?? [];
    }, [calendarTransactions, selectedCalendarDayKey]);

    const mobileCalendarDays = useMemo(() => {
        return Object.entries(calendarTransactions)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([dayKey, items]) => ({
                dayKey,
                items,
            }));
    }, [calendarTransactions]);

    const transactionActionButtons = (item: TransactionResponse) => (
        <div className="flex items-center justify-end gap-2 text-sm font-medium">
            <button className="cursor-pointer rounded-md px-2 py-1 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900" onClick={() => handleEdit(item)}>
                <i className="fas fa-edit mr-1"></i>Editar
            </button>
            <button className="cursor-pointer rounded-md px-2 py-1 text-rose-700 hover:bg-rose-50 hover:text-rose-900" onClick={() => handleDelete(item)}>
                <i className="fas fa-trash mr-1"></i>Eliminar
            </button>
        </div>
    );

    const renderEmptyState = (message: string) => (
        <div className="p-8 text-center text-sm text-gray-500">
            <i className="fas fa-inbox mb-2 block text-xl text-gray-400"></i>
            {message}
        </div>
    );

    return (
        <>
            <section className="app-page fade-in-up">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="page-title">Transactions</h1>
                        <p className="page-subtitle">Registra, filtra y ordena tus movimientos de forma rapida.</p>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
                        <button onClick={handleAdd} className="btn-modern btn-primary w-full justify-center lg:w-auto">
                            <i className="fas fa-plus mr-2"></i> Nuevo movimiento
                        </button>
                        <button className="btn-modern btn-secondary w-full justify-center lg:w-auto" onClick={handleTemplateDownload} disabled={isDownloadingTemplate}>
                            <i className="fas fa-file-arrow-down mr-2"></i> {isDownloadingTemplate ? "Descargando..." : "Plantilla Excel"}
                        </button>
                        <button className="btn-modern btn-secondary w-full justify-center lg:w-auto" onClick={handleExport} disabled={isExporting}>
                            <i className="fas fa-file-export mr-2"></i> {isExporting ? "Exportando..." : "Exportar Excel"}
                        </button>
                        <button className="btn-modern btn-secondary w-full justify-center lg:w-auto" onClick={handleImportClick} disabled={isImporting}>
                            <i className="fas fa-file-import mr-2"></i> {isImporting ? "Importando..." : "Importar Excel"}
                        </button>
                        <input ref={importInputRef} type="file" accept=".xlsx" className="hidden" onChange={handleImportFile} disabled={isImporting} />
                    </div>
                </div>

                {feedbackMessage && <Alert type="success" message={feedbackMessage} className="mb-4" onClose={() => setFeedbackMessage("")} />}
                {errorMessage && <Alert type="error" message={errorMessage} className="mb-4" onClose={() => setErrorMessage("")} />}

                <div className="soft-card mb-4 rounded-2xl p-4">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-2">
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

                        <button id="advanced-filter-toggle" className="btn-modern btn-ghost w-full justify-center sm:w-auto" onClick={() => handleShowModal("filter")}>
                            <i className="fas fa-sliders mr-2"></i> Filtros avanzados
                        </button>
                    </div>
                </div>

                <div className="soft-card mb-4 rounded-2xl p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2">
                            <button
                                className={`btn-modern ${viewMode === "list" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => setViewMode("list")}
                                type="button"
                            >
                                <i className="fas fa-table mr-2"></i> Tabla
                            </button>
                            <button
                                className={`btn-modern ${viewMode === "grid" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => setViewMode("grid")}
                                type="button"
                            >
                                <i className="fas fa-grip mr-2"></i> Cuadricula
                            </button>
                            <button
                                className={`btn-modern ${viewMode === "calendar" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => setViewMode("calendar")}
                                type="button"
                            >
                                <i className="fas fa-calendar-days mr-2"></i> Calendario
                            </button>
                        </div>

                        {viewMode === "calendar" && (
                            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
                                <button type="button" className="btn-modern btn-secondary" onClick={() => handleCalendarShift(-1)}>
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <span className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-gray-700 sm:min-w-40 sm:flex-none">{calendarMonthLabel}</span>
                                <button type="button" className="btn-modern btn-secondary" onClick={() => handleCalendarShift(1)}>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div id="list-view" className="soft-card overflow-hidden rounded-2xl">
                    {viewMode === "list" && (
                        <>
                            <div className="space-y-3 p-3 md:hidden">
                                {isLoading ? (
                                    Array.from({ length: 4 }, (_, index) => (
                                        <div key={index} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100"></div>
                                    ))
                                ) : error ? (
                                    <Alert type="error" message="Error cargando transacciones" />
                                ) : transactions.length === 0 ? (
                                    renderEmptyState("No hay transacciones para mostrar en lista.")
                                ) : (
                                    transactions.map((item) => (
                                        <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <span className={`status-chip ${item.transactionTypeId === 1 ? "status-income" : "status-expense"}`}>
                                                    {item.category}
                                                </span>
                                                <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="mb-2 text-sm text-gray-600">{item.description || "Sin descripcion"}</p>
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`text-sm font-bold ${
                                                        item.transactionTypeId === 1 ? "text-emerald-700" : "text-rose-700"
                                                    }`}
                                                >
                                                    <FormattedNumber value={item.amount} isAmount={true} />
                                                </span>
                                                {transactionActionButtons(item)}
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>

                            <div className="hidden overflow-x-auto md:block">
                                <table className="table-modern min-w-[700px]">
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
                                        ) : transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5}>{renderEmptyState("No hay transacciones para mostrar en lista.")}</td>
                                            </tr>
                                        ) : (
                                            transactions.map((item) => (
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
                                                    <td className="whitespace-nowrap text-right text-sm font-medium">{transactionActionButtons(item)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {viewMode === "grid" && (
                        <div className="p-4 sm:p-5">
                            {isLoading ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {Array.from({ length: 6 }, (_, index) => (
                                        <div key={index} className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-100"></div>
                                    ))}
                                </div>
                            ) : error ? (
                                <Alert type="error" message="Error cargando transacciones" />
                            ) : transactions.length === 0 ? (
                                renderEmptyState("No hay transacciones para mostrar en grid.")
                            ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                    {transactions.map((item) => (
                                        <article
                                            key={item.id}
                                            className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <span className="line-clamp-1 text-sm font-semibold text-gray-700">{item.category}</span>
                                                <span
                                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                                        item.transactionTypeId === 1
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-rose-100 text-rose-700"
                                                    }`}
                                                >
                                                    <i className={`fas ${item.transactionTypeId === 1 ? "fa-arrow-trend-up" : "fa-arrow-trend-down"}`}></i>
                                                </span>
                                            </div>
                                            <div
                                                className={`mb-1 text-base font-extrabold ${
                                                    item.transactionTypeId === 1 ? "text-emerald-700" : "text-rose-700"
                                                }`}
                                            >
                                                <FormattedNumber value={item.amount} isAmount={true} />
                                            </div>
                                            <p className="mb-2 line-clamp-2 min-h-10 text-xs text-gray-600">{item.description || "Sin descripcion"}</p>
                                            <div className="flex items-center justify-between text-[11px] text-gray-500">
                                                <span>{new Date(item.date).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-1">
                                                    <button className="rounded px-2 py-1 text-emerald-700 hover:bg-emerald-50" onClick={() => handleEdit(item)}>
                                                        Editar
                                                    </button>
                                                    <button className="rounded px-2 py-1 text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(item)}>
                                                        Borrar
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === "calendar" && (
                        <div className="p-2 sm:p-4">
                            {isLoading ? (
                                <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-gray-100"></div>
                            ) : error ? (
                                <Alert type="error" message="Error cargando transacciones" />
                            ) : (
                                <div className="space-y-3">
                                    <div className="space-y-2 sm:hidden">
                                        {mobileCalendarDays.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                                                No hay movimientos para este mes.
                                            </div>
                                        ) : (
                                            mobileCalendarDays.map(({ dayKey, items }) => (
                                                <button
                                                    key={dayKey}
                                                    type="button"
                                                    onClick={() => handleOpenCalendarDayModal(dayKey)}
                                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm"
                                                >
                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            {new Date(dayKey).toLocaleDateString("es-ES", {
                                                                weekday: "short",
                                                                day: "2-digit",
                                                                month: "short",
                                                            })}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-500">{items.length} mov.</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {items.slice(0, 3).map((item) => (
                                                            <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                                                                <span className="truncate text-gray-600">{item.category}</span>
                                                                <span
                                                                    className={`font-semibold ${
                                                                        item.transactionTypeId === 1 ? "text-emerald-700" : "text-rose-700"
                                                                    }`}
                                                                >
                                                                    <FormattedNumber value={item.amount} isAmount={true} />
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {items.length > 3 && <span className="text-[11px] font-semibold text-gray-500">+{items.length - 3} mas</span>}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    <div className="hidden overflow-x-auto sm:block">
                                        <div className="min-w-[760px]">
                                            <div className="grid grid-cols-7 border-b border-gray-200">
                                                {weekDays.map((day) => (
                                                    <div key={day} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-px rounded-xl bg-gray-200">
                                                {calendarCells.map((cell) => (
                                                    <button
                                                        type="button"
                                                        key={cell.key}
                                                        onClick={() => handleOpenCalendarDayModal(cell.key)}
                                                        className={`min-h-28 cursor-pointer p-2 text-left transition duration-150 hover:-translate-y-[1px] hover:shadow-sm ${
                                                            cell.isCurrentMonth
                                                                ? "bg-white text-gray-700 hover:bg-emerald-50 hover:ring-1 hover:ring-emerald-200"
                                                                : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:ring-1 hover:ring-gray-200"
                                                        }`}
                                                        title="Click para ver el detalle del dia"
                                                    >
                                                        <div className="mb-2 text-xs font-semibold">{cell.date.getDate()}</div>
                                                        <div className="space-y-1">
                                                            {cell.dayTransactions.slice(0, 2).map((item) => (
                                                                <span
                                                                    key={item.id}
                                                                    className={`block w-full truncate rounded px-1.5 py-1 text-left text-[11px] font-medium ${
                                                                        item.transactionTypeId === 1
                                                                            ? "bg-emerald-100 text-emerald-800"
                                                                            : "bg-rose-100 text-rose-800"
                                                                    }`}
                                                                    title={`${item.category} - ${item.description}`}
                                                                >
                                                                    {item.category}: <FormattedNumber value={item.amount} isAmount={true} />
                                                                </span>
                                                            ))}
                                                            {cell.dayTransactions.length > 2 && (
                                                                <span className="block text-[11px] font-semibold text-gray-500">
                                                                    +{cell.dayTransactions.length - 2} mas
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isLoading && !error && !isCalendarView && (
                        <Pagination
                            currentPage={page}
                            totalItems={data?.totalItems ?? 0}
                            itemsPerPage={perPage}
                            onPageChange={(newPage: number) => setPage(newPage)}
                            onItemsPerPageChange={(items: number) => setPerPage(items)}
                            perPageOptions={[5, 10, 20, 50, 100]}
                        />
                    )}
                </div>
            </section>

            {currentModal === "add" && (
                <Modal title={`${transactionResponse?.id ? "Edit" : "Add"} Transaction`} disableClickOutside={true}>
                    <AddTransaction data={transactionResponse} onSuccess={handleOnSuccess} />
                </Modal>
            )}

            {currentModal === "filter" && <AdvancedFilterModal filters={filters} onFiltersChange={handleFiltersChange} hideDateFilters={isCalendarView} />}

            {currentModal === "calendar-day" && (
                <Modal
                    title="Movimientos del dia"
                    description={selectedCalendarDate.toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    })}
                >
                    {selectedCalendarItems.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                            No hay movimientos para este dia.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {selectedCalendarItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className={`status-chip ${item.transactionTypeId === 1 ? "status-income" : "status-expense"}`}>
                                                {item.category}
                                            </span>
                                        </div>
                                        <p className="truncate text-sm text-gray-700">{item.description || "Sin descripcion"}</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                                        <span
                                            className={`text-sm font-bold ${
                                                item.transactionTypeId === 1 ? "text-emerald-700" : "text-rose-700"
                                            }`}
                                        >
                                            <FormattedNumber value={item.amount} isAmount={true} />
                                        </span>
                                        {transactionActionButtons(item)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}

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
