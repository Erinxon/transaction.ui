import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from '../../../components';
import Pagination from '../../../components/Pagination';
import {
  activateUser,
  confirmUserEmail,
  deactivateUser,
  getAdminUserById,
  getAdminUsers,
  getUserStatistics,
} from '../../../core/admin/services/adminApi';
import type { AdminUsersRequest } from '../../../core/admin/types/admin.types';

const toRequest = (searchTerm: string, page: number, pageSize: number): AdminUsersRequest => ({
  searchTerm: searchTerm || undefined,
  page,
  pageSize,
});

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const request = useMemo(() => toRequest(searchTerm, page, pageSize), [searchTerm, page, pageSize]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['adminUsers', request],
    queryFn: ({ queryKey }) => getAdminUsers(queryKey[1] as AdminUsersRequest),
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

  useEffect(() => {
    if (!selectedUserId && data && data.length > 0) {
      setSelectedUserId(data[0].id);
    }
  }, [data, selectedUserId]);

  const { data: userDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['adminUserDetail', selectedUserId],
    queryFn: ({ queryKey }) => getAdminUserById(queryKey[1] as string),
    enabled: Boolean(selectedUserId),
  });

  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminUserStats', selectedUserId],
    queryFn: ({ queryKey }) => getUserStatistics(queryKey[1] as string),
    enabled: Boolean(selectedUserId),
  });

  const { mutate: activateMutate, isPending: isActivating } = useMutation({
    mutationFn: activateUser,
    onSuccess: (response) => {
      setFeedback(response.message);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail', selectedUserId] });
    },
  });

  const { mutate: deactivateMutate, isPending: isDeactivating } = useMutation({
    mutationFn: deactivateUser,
    onSuccess: (response) => {
      setFeedback(response.message);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail', selectedUserId] });
    },
  });

  const { mutate: confirmEmailMutate, isPending: isConfirmingEmail } = useMutation({
    mutationFn: confirmUserEmail,
    onSuccess: (response) => {
      setFeedback(response.message || 'Correo confirmado correctamente');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail', selectedUserId] });
    },
  });

  return (
    <section className="app-page fade-in-up">
      <div className="mb-6">
        <h1 className="page-title">Gestion de Usuarios</h1>
        <p className="page-subtitle">Busqueda, detalle, estadisticas y activacion/desactivacion de cuentas.</p>
      </div>

      {feedback && <Alert type="success" message={feedback} className="mb-4" onClose={() => setFeedback('')} />}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="w-full text-sm text-gray-600 lg:max-w-md">
          Buscar por nombre o email
          <input
            className="field-modern mt-1"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="john, admin@transaction.com"
          />
        </label>

      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="soft-card rounded-2xl p-0 xl:col-span-3">
          {isLoading ? (
            <p className="p-4 text-sm text-gray-600">Cargando usuarios...</p>
          ) : error ? (
            <div className="p-4">
              <Alert type="error" message="No se pudo cargar el listado de usuarios." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th className="text-left">Usuario</th>
                      <th className="text-left">Email</th>
                      <th className="text-left">Correo</th>
                      <th className="text-left">Admin</th>
                      <th className="text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data ?? []).map((user) => (
                      <tr
                        key={user.id}
                        className={selectedUserId === user.id ? 'bg-emerald-50/70' : ''}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <td className="text-sm text-gray-700">
                          {user.firstName} {user.lastName}
                          <div className="text-xs text-gray-500">@{user.userName}</div>
                        </td>
                        <td className="text-sm text-gray-600">{user.email}</td>
                        <td className="text-sm">
                          <span className={`status-chip ${user.emailConfirmed ? 'status-income' : 'status-expense'}`}>
                            {user.emailConfirmed ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="text-sm text-gray-700">{user.isAdmin ? 'Si' : 'No'}</td>
                        <td className="text-sm">
                          <span className={`status-chip ${user.lockoutEnabled ? 'status-expense' : 'status-income'}`}>
                            {user.lockoutEnabled ? 'Inactivo' : 'Activo'}
                          </span>
                        </td>
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
            </>
          )}
        </div>

        <div className="soft-card rounded-2xl p-4 xl:col-span-2">
          {!selectedUserId ? (
            <p className="text-sm text-gray-600">Selecciona un usuario para ver su detalle.</p>
          ) : isLoadingDetail ? (
            <p className="text-sm text-gray-600">Cargando detalle...</p>
          ) : (
            <>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Detalle de Usuario</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Nombre:</strong> {userDetail?.firstName} {userDetail?.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {userDetail?.email}
                </p>
                <p>
                  <strong>Telefono:</strong> {userDetail?.phoneNumber ?? '-'}
                </p>
                <p>
                  <strong>Admin:</strong> {userDetail?.isAdmin ? 'Si' : 'No'}
                </p>
                <p>
                  <strong>2FA:</strong> {userDetail?.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}
                </p>
                <p>
                  <strong>Email confirmado:</strong> {userDetail?.emailConfirmed ? 'Si' : 'No'}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="btn-modern btn-primary"
                  disabled={isActivating || isDeactivating || isConfirmingEmail || !selectedUserId}
                  onClick={() => selectedUserId && activateMutate(selectedUserId)}
                >
                  Activar
                </button>
                <button
                  className="btn-modern btn-secondary"
                  disabled={isActivating || isDeactivating || isConfirmingEmail || !selectedUserId}
                  onClick={() => selectedUserId && deactivateMutate(selectedUserId)}
                >
                  Desactivar
                </button>
                {!userDetail?.emailConfirmed && (
                  <button
                    className="btn-modern btn-secondary"
                    disabled={isActivating || isDeactivating || isConfirmingEmail || !selectedUserId}
                    onClick={() => selectedUserId && confirmEmailMutate(selectedUserId)}
                  >
                    {isConfirmingEmail ? 'Confirmando...' : 'Confirmar correo'}
                  </button>
                )}
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <h3 className="mb-2 text-base font-semibold text-gray-900">Estadisticas</h3>
                {isLoadingStats ? (
                  <p className="text-sm text-gray-600">Cargando estadisticas...</p>
                ) : (
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <strong>Total transacciones:</strong> {userStats?.TotalTransactions ?? 0}
                    </p>
                    <p>
                      <strong>Total ingresos:</strong> {userStats?.TotalIncome ?? 0}
                    </p>
                    <p>
                      <strong>Total gastos:</strong> {userStats?.TotalExpense ?? 0}
                    </p>
                    <p>
                      <strong>Ultima transaccion:</strong>{' '}
                      {userStats?.LastTransactionDate ? new Date(userStats.LastTransactionDate).toLocaleString() : '-'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};