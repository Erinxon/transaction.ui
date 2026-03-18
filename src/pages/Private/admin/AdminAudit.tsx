import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '../../../components';
import Pagination from '../../../components/Pagination';
import { getAllAudits } from '../../../core/admin/services/adminApi';
import type { AdminAuditRequest } from '../../../core/admin/types/admin.types';

const toRequest = (
  userId: string,
  from: string,
  to: string,
  action: string,
  page: number,
  pageSize: number,
): AdminAuditRequest => ({
  userId: userId || undefined,
  from: from || undefined,
  to: to || undefined,
  action: action || undefined,
  page,
  pageSize,
});

export const AdminAudit = () => {
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const request = useMemo(() => toRequest(userId, from, to, action, page, pageSize), [userId, from, to, action, page, pageSize]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['adminAudit', request],
    queryFn: ({ queryKey }) => getAllAudits(queryKey[1] as AdminAuditRequest),
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

  return (
    <section className="app-page fade-in-up">
      <div className="mb-6">
        <h1 className="page-title">Auditoria de Usuarios</h1>
        <p className="page-subtitle">Trazabilidad completa de acciones de usuarios y cambios de entidades.</p>
      </div>

      <div className="soft-card mb-4 rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm text-gray-600 xl:col-span-2">
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

          <label className="text-sm text-gray-600">
            Desde
            <input type="date" className="field-modern mt-1" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>

          <label className="text-sm text-gray-600">
            Hasta
            <input type="date" className="field-modern mt-1" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>

          <label className="text-sm text-gray-600">
            Accion
            <select
              className="select-modern mt-1"
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
              <option value="Register">Register</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
              <option value="View">View</option>
              <option value="Export">Export</option>
              <option value="Import">Import</option>
            </select>
          </label>
        </div>

      </div>

      {isLoading ? (
        <p className="text-sm text-gray-600">Cargando auditorias...</p>
      ) : error ? (
        <Alert type="error" message="No se pudieron cargar los registros de auditoria." />
      ) : (
        <div className="soft-card rounded-2xl p-0">
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="text-left">Fecha</th>
                  <th className="text-left">Usuario</th>
                  <th className="text-left">Accion</th>
                  <th className="text-left">Entidad</th>
                  <th className="text-left">Entity ID</th>
                  <th className="text-left">IP</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((audit) => (
                  <tr key={audit.id}>
                    <td className="whitespace-nowrap text-sm text-gray-600">{new Date(audit.timestamp).toLocaleString()}</td>
                    <td className="text-sm text-gray-700">{audit.userName}</td>
                    <td className="text-sm">
                      <span className="status-chip status-income">{audit.action}</span>
                    </td>
                    <td className="text-sm text-gray-700">{audit.entityName}</td>
                    <td className="text-sm text-gray-600">{audit.entityId ?? '-'}</td>
                    <td className="text-sm text-gray-600">{audit.ipAddress ?? '-'}</td>
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