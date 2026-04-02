import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from '../../../components';
import Pagination from '../../../components/Pagination';
import {
  TransactionType,
  TRANSACTION_TYPE_BADGE_CLASSES,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_OPTIONS,
} from '../../../core/Category/types/category.types';
import {
  createAdminCategory,
  deleteAdminCategory,
  downloadAdminCategoriesTemplate,
  exportAdminCategories,
  getAdminCategories,
  importAdminCategories,
  updateAdminCategory,
} from '../../../core/admin/services/adminApi';
import type {
  AdminCategoriesRequest,
  AdminCategory,
  ImportCategoriesResponse,
  UpsertAdminCategoryRequest,
} from '../../../core/admin/types/admin.types';

const toRequest = (
  searchTerm: string,
  page: number,
  pageSize: number,
  transactionType: TransactionType | '',
): AdminCategoriesRequest => ({
  searchTerm: searchTerm || undefined,
  page,
  pageSize,
  transactionType: transactionType || undefined,
});

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getTransactionTypeIcon = (transactionTypeId: number) => {
  return transactionTypeId === TransactionType.Income ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
};

const getTransactionTypeBadgeClassName = (transactionTypeId: number) => {
  return (
    TRANSACTION_TYPE_BADGE_CLASSES[transactionTypeId as TransactionType] ??
    TRANSACTION_TYPE_BADGE_CLASSES[TransactionType.Expenses]
  );
};

const getTransactionTypeLabel = (transactionTypeId: number) => {
  return TRANSACTION_TYPE_LABELS[transactionTypeId as TransactionType] ?? TRANSACTION_TYPE_LABELS[TransactionType.Expenses];
};

export const AdminCategories = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [transactionTypeId, setTransactionTypeId] = useState<TransactionType>(TransactionType.Expenses);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionType | ''>('');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [importResult, setImportResult] = useState<ImportCategoriesResponse | null>(null);

  const request = useMemo(
    () => toRequest(searchTerm, page, pageSize, transactionTypeFilter),
    [searchTerm, page, pageSize, transactionTypeFilter],
  );

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['adminCategories', request],
    queryFn: ({ queryKey }) => getAdminCategories(queryKey[1] as AdminCategoriesRequest),
  });

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setTransactionTypeId(TransactionType.Expenses);
  };

  const reloadCategories = () => {
    queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
  };

  const { mutate: upsertCategory, isPending: isSaving } = useMutation({
    mutationFn: (payload: UpsertAdminCategoryRequest) => {
      if (editingId) {
        return updateAdminCategory(editingId, payload);
      }

      return createAdminCategory(payload);
    },
    onSuccess: () => {
      setErrorMessage('');
      setFeedback(editingId ? 'Categoria actualizada correctamente.' : 'Categoria creada correctamente.');
      resetForm();
      reloadCategories();
    },
    onError: () => {
      setFeedback('');
      setErrorMessage('No se pudo guardar la categoria. Revisa los datos e intenta nuevamente.');
    },
  });

  const { mutate: removeCategory, isPending: isDeleting } = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: (response) => {
      setErrorMessage('');
      setFeedback(response.message || 'Categoria eliminada exitosamente.');
      reloadCategories();
    },
    onError: () => {
      setFeedback('');
      setErrorMessage('No se pudo eliminar la categoria. Puede estar en uso por transacciones.');
    },
  });

  const { mutate: importCategoriesMutation, isPending: isImporting } = useMutation({
    mutationFn: importAdminCategories,
    onSuccess: (response) => {
      setErrorMessage('');
      setImportResult(response);
      setFeedback(`Importacion completada. Categorias importadas: ${response.importedCount}.`);
      reloadCategories();
    },
    onError: () => {
      setFeedback('');
      setImportResult(null);
      setErrorMessage('No se pudo importar el archivo. Verifica que sea .xlsx o .xls.');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !description.trim()) {
      setFeedback('');
      setErrorMessage('Nombre y descripcion son requeridos.');
      return;
    }

    if (![TransactionType.Income, TransactionType.Expenses].includes(transactionTypeId)) {
      setFeedback('');
      setErrorMessage('Debes seleccionar un tipo de transaccion valido.');
      return;
    }

    upsertCategory({
      name: name.trim(),
      description: description.trim(),
      transactionTypeId,
    });
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
    setTransactionTypeId(
      [TransactionType.Income, TransactionType.Expenses].includes(category.transactionTypeId as TransactionType)
        ? (category.transactionTypeId as TransactionType)
        : TransactionType.Expenses,
    );
    setFeedback('');
    setErrorMessage('');
  };

  const handleDelete = (id: number, categoryName: string) => {
    const isConfirmed = window.confirm(`Deseas eliminar la categoria "${categoryName}"?`);
    if (!isConfirmed) {
      return;
    }

    removeCategory(id);
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadAdminCategoriesTemplate();
      triggerDownload(blob, 'plantilla_categorias.xlsx');
      setFeedback('Plantilla descargada exitosamente.');
      setErrorMessage('');
    } catch {
      setFeedback('');
      setErrorMessage('No se pudo descargar la plantilla de categorias.');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportAdminCategories();
      triggerDownload(blob, 'categorias_export.xlsx');
      setFeedback('Exportacion de categorias completada.');
      setErrorMessage('');
    } catch {
      setFeedback('');
      setErrorMessage('No se pudo exportar el listado de categorias.');
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    importCategoriesMutation(file);
    event.target.value = '';
  };

  return (
    <section className="app-page fade-in-up">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Gestion de Categorias</h1>
          <p className="page-subtitle">Administra categorias de forma individual o masiva con archivos Excel.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-modern btn-secondary" onClick={handleTemplateDownload}>
            <i className="fas fa-file-arrow-down mr-2" /> Plantilla
          </button>

          <button className="btn-modern btn-secondary" onClick={handleExport}>
            <i className="fas fa-file-export mr-2" /> Exportar
          </button>

          <label className="btn-modern btn-primary cursor-pointer">
            <i className="fas fa-file-import mr-2" /> {isImporting ? 'Importando...' : 'Importar Excel'}
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportFile}
              disabled={isImporting}
            />
          </label>
        </div>
      </div>

      {feedback && <Alert type="success" message={feedback} className="mb-4" onClose={() => setFeedback('')} />}
      {errorMessage && <Alert type="error" message={errorMessage} className="mb-4" onClose={() => setErrorMessage('')} />}
      <Alert
        type="info"
        className="mb-4"
        message="Las categorias existentes quedaron marcadas como Gasto por defecto. Revisa y actualiza las que correspondan a Ingreso."
      />
      <Alert
        type="info"
        className="mb-4"
        message="La importacion y la plantilla de Excel ahora requieren la columna TransactionType con valores Income/Ingreso o Expenses/Gasto."
      />

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <form onSubmit={handleSubmit} className="soft-card rounded-2xl p-4 xl:col-span-1">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            {editingId ? 'Actualizar categoria' : 'Crear categoria'}
          </h2>

          <div className="space-y-3">
            <label className="text-sm text-gray-600">
              Nombre
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                className="field-modern mt-1"
                placeholder="Ej. Alimentacion"
              />
            </label>

            <label className="text-sm text-gray-600">
              Descripcion
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={150}
                className="field-modern mt-1 min-h-28"
                placeholder="Ej. Gastos relacionados con comida y bebidas"
              />
            </label>

            <label className="text-sm text-gray-600">
              Tipo de transaccion
              <select
                value={transactionTypeId}
                onChange={(event) => setTransactionTypeId(Number(event.target.value) as TransactionType)}
                className="select-modern mt-1"
              >
                {TRANSACTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-modern btn-primary" disabled={isSaving} type="submit">
              {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>

            <button className="btn-modern btn-ghost" type="button" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </form>

        <div className="soft-card rounded-2xl p-4 xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="w-full text-sm text-gray-600 lg:max-w-md">
              Buscar categorias
              <input
                className="field-modern mt-1"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                placeholder="Ej. alimentacion"
              />
            </label>

            <label className="w-full text-sm text-gray-600 lg:max-w-xs">
              Filtrar por tipo
              <select
                className="select-modern mt-1"
                value={transactionTypeFilter}
                onChange={(event) => {
                  setTransactionTypeFilter(event.target.value ? (Number(event.target.value) as TransactionType) : '');
                  setPage(1);
                }}
              >
                <option value="">Todos</option>
                {TRANSACTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-600">Cargando categorias...</p>
          ) : error ? (
            <Alert type="error" message="No se pudo cargar el listado de categorias." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th className="text-left">Nombre</th>
                      <th className="text-left">Descripcion</th>
                      <th className="text-left">Tipo</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.data ?? []).length === 0 ? (
                      <tr>
                        <td className="text-sm text-gray-600" colSpan={4}>
                          No hay categorias registradas.
                        </td>
                      </tr>
                    ) : (
                      (data?.data ?? []).map((category) => (
                        <tr key={category.id}>
                          <td className="text-sm font-medium text-gray-700">{category.name}</td>
                          <td className="max-w-96 truncate text-sm text-gray-600">{category.description}</td>
                          <td className="text-sm">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getTransactionTypeBadgeClassName(
                                category.transactionTypeId,
                              )}`}
                            >
                              <i className={`fas ${getTransactionTypeIcon(category.transactionTypeId)}`} />
                              {getTransactionTypeLabel(category.transactionTypeId)}
                            </span>
                          </td>
                          <td className="text-right text-sm">
                            <button
                              className="mr-3 cursor-pointer text-emerald-700 hover:text-emerald-900"
                              onClick={() => handleEdit(category)}
                            >
                              <i className="fas fa-edit" />
                            </button>

                            <button
                              className="cursor-pointer text-rose-700 hover:text-rose-900"
                              onClick={() => handleDelete(category.id, category.name)}
                              disabled={isDeleting}
                            >
                              <i className="fas fa-trash" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {Boolean(data?.totalCount) && (
                <Pagination
                  currentPage={data?.page ?? page}
                  totalItems={data?.totalCount ?? 0}
                  itemsPerPage={data?.pageSize ?? pageSize}
                  onPageChange={(nextPage) => setPage(nextPage)}
                  onItemsPerPageChange={(items) => {
                    setPageSize(items);
                    setPage(1);
                  }}
                  perPageOptions={[5, 10, 20, 50, 100]}
                />
              )}
            </>
          )}

          {isFetching && <p className="mt-3 text-xs text-gray-500">Actualizando listado...</p>}
        </div>
      </div>

      {importResult && importResult.errors.length > 0 && (
        <div className="soft-card rounded-2xl p-4">
          <h3 className="mb-3 text-base font-semibold text-rose-700">Errores de importacion</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {importResult.errors.map((item, index) => (
              <li key={`${item}-${index}`}>- {item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};