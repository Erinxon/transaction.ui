import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, DashboardCard } from '../../../components';
import { getAdminDashboard } from '../../../core/admin/services/adminApi';
import type { DateRangeFilter } from '../../../core/admin/types/admin.types';

const toDateRange = (from: string, to: string): DateRangeFilter => ({
  from: from || undefined,
  to: to || undefined,
});

export const AdminDashboard = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const request = useMemo(() => toDateRange(from, to), [from, to]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard', request],
    queryFn: ({ queryKey }) => getAdminDashboard(queryKey[1] as DateRangeFilter),
  });

  return (
    <section className="app-page fade-in-up">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title">Panel Administrativo</h1>
          <p className="page-subtitle">Metrica operativa del sistema, errores recientes y endpoints mas usados.</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="text-sm text-gray-600">
            Desde
            <input
              type="date"
              className="field-modern mt-1"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          <label className="text-sm text-gray-600">
            Hasta
            <input
              type="date"
              className="field-modern mt-1"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-600">Cargando dashboard...</p>
      ) : error ? (
        <Alert type="error" message="No se pudieron cargar las metricas del panel administrativo." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DashboardCard title="Total Requests" value={data?.totalRequests ?? 0} color="neutral">
              <i className="fas fa-network-wired" />
            </DashboardCard>
            <DashboardCard title="Total Errores" value={data?.totalErrors ?? 0} color="red">
              <i className="fas fa-triangle-exclamation" />
            </DashboardCard>
            <DashboardCard
              title="Tasa de Error"
              value={`${(((data?.totalErrors ?? 0) / Math.max(data?.totalRequests ?? 1, 1)) * 100).toFixed(2)}%`}
              color="green"
            >
              <i className="fas fa-chart-pie" />
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="soft-card rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Logs por nivel</h2>
              <div className="space-y-3">
                {Object.entries(data?.logsByLevel ?? {}).map(([level, total]) => (
                  <div key={level} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">{level}</span>
                    <span className="text-sm font-semibold text-gray-900">{total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Endpoints mas usados</h2>
              <div className="space-y-2">
                {Object.entries(data?.mostUsedEndpoints ?? {}).map(([path, total]) => (
                  <div key={path} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span className="max-w-[75%] truncate text-sm text-gray-700">{path}</span>
                    <span className="text-sm font-semibold text-gray-900">{total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card rounded-2xl p-5 xl:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Errores recientes</h2>
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th className="text-left">Fecha</th>
                      <th className="text-left">Mensaje</th>
                      <th className="text-left">Endpoint</th>
                      <th className="text-left">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentErrors ?? []).map((errorItem) => (
                      <tr key={errorItem.id}>
                        <td className="whitespace-nowrap text-sm text-gray-600">
                          {new Date(errorItem.timestamp).toLocaleString()}
                        </td>
                        <td className="max-w-80 truncate text-sm text-gray-800">{errorItem.message}</td>
                        <td className="max-w-72 truncate text-sm text-gray-600">{errorItem.requestPath ?? '-'}</td>
                        <td className="text-sm text-gray-600">{errorItem.userName ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};