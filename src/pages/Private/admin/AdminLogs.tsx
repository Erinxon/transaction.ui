import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '../../../components';
import Pagination from '../../../components/Pagination';
import { Modal } from '../../../components/Modal/Modal';
import { useModalContext } from '../../../components/Modal/context';
import { getAdminLogs, getLogStatistics } from '../../../core/admin/services/adminApi';
import type { AdminLogsRequest, DateRangeFilter, LogLevel, SystemLog } from '../../../core/admin/types/admin.types';

const toRequest = (
  from: string,
  to: string,
  level: string,
  userId: string,
  requestPath: string,
  page: number,
  pageSize: number,
): AdminLogsRequest => ({
  from: from || undefined,
  to: to || undefined,
  level: (level as LogLevel) || undefined,
  userId: userId || undefined,
  requestPath: requestPath || undefined,
  page,
  pageSize,
});

const getLevelChipClass = (logLevel: string) => {
  switch (logLevel) {
    case 'Information':
      return 'status-income';
    case 'Warning':
      return 'status-expense';
    case 'Error':
      return 'status-expense';
    case 'Fatal':
      return 'status-expense';
    default:
      return 'status-income';
  }
};

const formatJsonLike = (value: string | null) => {
  if (!value) {
    return '-';
  }

  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
};

export const AdminLogs = () => {
  const { setIsOpen } = useModalContext();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [level, setLevel] = useState('');
  const [userId, setUserId] = useState('');
  const [requestPath, setRequestPath] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const request = useMemo(
    () => toRequest(from, to, level, userId, requestPath, page, pageSize),
    [from, to, level, userId, requestPath, page, pageSize],
  );

  const dateFilter: DateRangeFilter = useMemo(() => ({ from: from || undefined, to: to || undefined }), [from, to]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['adminLogs', request],
    queryFn: ({ queryKey }) => getAdminLogs(queryKey[1] as AdminLogsRequest),
  });

  useEffect(() => {
    if (!data || data.length === 0) {
      setSelectedLogId(null);
      return;
    }

    const stillExists = data.some((logItem) => logItem.id === selectedLogId);
    if (!stillExists) {
      setSelectedLogId(data[0].id);
    }
  }, [data, selectedLogId]);

  const selectedLog: SystemLog | null = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    return data.find((logItem) => logItem.id === selectedLogId) ?? data[0];
  }, [data, selectedLogId]);

  const estimatedTotalItems = useMemo(() => {
    const items = data ?? [];

    if (items.length === 0) {
      return 0;
    }

    if (items.length < pageSize) {
      return (page - 1) * pageSize + items.length;
    }

    return page * pageSize + 1;
  }, [data, page, pageSize]);

  const { data: logStats } = useQuery({
    queryKey: ['adminLogsStats', dateFilter],
    queryFn: ({ queryKey }) => getLogStatistics(queryKey[1] as DateRangeFilter),
  });

  const openLogDetail = (logId: string) => {
    setSelectedLogId(logId);
    setIsOpen(true);
  };

  return (
    <section className="app-page fade-in-up">
      <div className="mb-6">
        <h1 className="page-title">Logs y Monitoreo</h1>
        <p className="page-subtitle">Busqueda avanzada sobre logs del sistema con filtros operativos.</p>
      </div>

      <div className="soft-card mb-4 rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm text-gray-600">
            Desde
            <input type="date" className="field-modern mt-1" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-sm text-gray-600">
            Hasta
            <input type="date" className="field-modern mt-1" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="text-sm text-gray-600">
            Nivel
            <select
              className="select-modern mt-1"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="Information">Information</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
              <option value="Fatal">Fatal</option>
            </select>
          </label>
          <label className="text-sm text-gray-600">
            User ID
            <input
              className="field-modern mt-1"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setPage(1);
              }}
              placeholder="guid"
            />
          </label>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <label className="text-sm text-gray-600">
            Request Path
            <input
              className="field-modern mt-1"
              value={requestPath}
              onChange={(e) => {
                setRequestPath(e.target.value);
                setPage(1);
              }}
              placeholder="/api/admin/logs"
            />
          </label>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(logStats ?? {}).map(([key, value]) => (
          <div key={key} className="soft-card rounded-xl p-3">
            <p className="text-xs uppercase tracking-wider text-gray-500">{key}</p>
            <p className="text-xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-600">Cargando logs...</p>
      ) : error ? (
        <Alert type="error" message="No se pudieron cargar los logs." />
      ) : (
        <div className="soft-card rounded-2xl p-0">
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="text-left">Fecha</th>
                  <th className="text-left">Nivel</th>
                  <th className="text-left">Mensaje</th>
                  <th className="text-left">Path</th>
                  <th className="text-left">Metodo</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Usuario</th>
                  <th className="text-left">IP</th>
                  <th className="text-left">Tiempo</th>
                  <th className="text-left">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((logItem) => (
                  <tr
                    key={logItem.id}
                    className={`${selectedLog?.id === logItem.id ? 'bg-emerald-50/70' : ''} cursor-pointer transition-colors duration-150 hover:bg-emerald-100/70`}
                    onClick={() => openLogDetail(logItem.id)}
                    title="Haz clic para ver el detalle"
                  >
                    <td className="whitespace-nowrap text-sm text-gray-600">{new Date(logItem.timestamp).toLocaleString()}</td>
                    <td className="text-sm">
                      <span className={`status-chip ${getLevelChipClass(logItem.level)}`}>{logItem.level}</span>
                    </td>
                    <td className="max-w-80 truncate text-sm text-gray-800">{logItem.message}</td>
                    <td className="max-w-72 truncate text-sm text-gray-600">{logItem.requestPath ?? '-'}</td>
                    <td className="text-sm text-gray-600">{logItem.requestMethod ?? '-'}</td>
                    <td className="text-sm text-gray-600">{logItem.statusCode ?? '-'}</td>
                    <td className="text-sm text-gray-600">{logItem.userName ?? '-'}</td>
                    <td className="max-w-52 truncate text-sm text-gray-600">{logItem.ipAddress ?? '-'}</td>
                    <td className="text-sm text-gray-600">{logItem.responseTimeMs != null ? `${logItem.responseTimeMs} ms` : '-'}</td>
                    <td className="text-sm font-medium text-emerald-700">Ver</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {estimatedTotalItems > 0 && (
            <Pagination
              currentPage={page}
              totalItems={estimatedTotalItems}
              itemsPerPage={pageSize}
              onPageChange={(nextPage) => setPage(Math.max(1, nextPage))}
              onItemsPerPageChange={(items) => {
                setPageSize(items);
                setPage(1);
              }}
              perPageOptions={[10, 20, 50, 100]}
            />
          )}

          {isFetching && <p className="px-4 pb-3 text-xs text-gray-500">Actualizando datos...</p>}
        </div>
      )}

      <Modal
        title="Detalle del log"
        description="Informacion completa del registro seleccionado"
      >
        {!selectedLog ? (
          <p className="text-sm text-gray-600">No hay log seleccionado.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={`status-chip ${getLevelChipClass(selectedLog.level)}`}>{selectedLog.level}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                {selectedLog.requestMethod ?? 'N/A'}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                Status: {selectedLog.statusCode ?? 'N/A'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Id</p>
                <p className="mt-1 break-all text-sm text-gray-800">{selectedLog.id}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Timestamp</p>
                <p className="mt-1 text-sm text-gray-800">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Response Time</p>
                <p className="mt-1 text-sm text-gray-800">{selectedLog.responseTimeMs != null ? `${selectedLog.responseTimeMs} ms` : '-'}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Request Path</p>
                <p className="mt-1 break-all text-sm text-gray-800">{selectedLog.requestPath ?? '-'}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">User Name</p>
                <p className="mt-1 text-sm text-gray-800">{selectedLog.userName ?? '-'}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">User Id</p>
                <p className="mt-1 break-all text-sm text-gray-800">{selectedLog.userId ?? '-'}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">IP Address</p>
                <p className="mt-1 text-sm text-gray-800">{selectedLog.ipAddress ?? '-'}</p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Message</p>
              <pre className="max-h-52 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 whitespace-pre-wrap break-words">
                {selectedLog.message || '-'}
              </pre>
            </div>

            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Exception</p>
              <pre className="max-h-52 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 whitespace-pre-wrap break-words">
                {selectedLog.exception || '-'}
              </pre>
            </div>

            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Properties</p>
              <pre className="max-h-56 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 whitespace-pre-wrap break-words">
                {formatJsonLike(selectedLog.properties)}
              </pre>
            </div>

            <div className="flex justify-end">
              <button className="btn-modern btn-secondary" onClick={() => setIsOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};