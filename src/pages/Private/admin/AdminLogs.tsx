import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '../../../components';
import Pagination from '../../../components/Pagination';
import { getAdminLogs, getLogStatistics } from '../../../core/admin/services/adminApi';
import type { AdminLogsRequest, DateRangeFilter, LogLevel } from '../../../core/admin/types/admin.types';

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

export const AdminLogs = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [level, setLevel] = useState('');
  const [userId, setUserId] = useState('');
  const [requestPath, setRequestPath] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const request = useMemo(
    () => toRequest(from, to, level, userId, requestPath, page, pageSize),
    [from, to, level, userId, requestPath, page, pageSize],
  );

  const dateFilter: DateRangeFilter = useMemo(() => ({ from: from || undefined, to: to || undefined }), [from, to]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['adminLogs', request],
    queryFn: ({ queryKey }) => getAdminLogs(queryKey[1] as AdminLogsRequest),
  });

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
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((logItem) => (
                  <tr key={logItem.id}>
                    <td className="whitespace-nowrap text-sm text-gray-600">{new Date(logItem.timestamp).toLocaleString()}</td>
                    <td className="text-sm">
                      <span className="status-chip status-expense">{logItem.level}</span>
                    </td>
                    <td className="max-w-80 truncate text-sm text-gray-800">{logItem.message}</td>
                    <td className="max-w-72 truncate text-sm text-gray-600">{logItem.requestPath ?? '-'}</td>
                    <td className="text-sm text-gray-600">{logItem.requestMethod ?? '-'}</td>
                    <td className="text-sm text-gray-600">{logItem.statusCode ?? '-'}</td>
                    <td className="text-sm text-gray-600">{logItem.userName ?? '-'}</td>
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
    </section>
  );
};