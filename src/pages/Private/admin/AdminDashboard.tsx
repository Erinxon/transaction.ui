import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, DashboardCard } from '../../../components';
import {
  getAdminDashboard,
  getReportDiagnostics,
  triggerManualReportScheduling,
} from '../../../core/admin/services/adminApi';
import type {
  DateRangeFilter,
  ReportDiagnosticsResponse,
  ScheduledReportJob,
} from '../../../core/admin/types/admin.types';
import { useI18n } from '../../../core/i18n/useI18n';

type Translator = ReturnType<typeof useI18n>['t'];

const toDateRange = (from: string, to: string): DateRangeFilter => ({
  from: from || undefined,
  to: to || undefined,
});

const getDiagnosticsTone = (diagnostics?: ReportDiagnosticsResponse) => {
  if (!diagnostics) {
    return 'neutral' as const;
  }

  if (diagnostics.existingJobs === diagnostics.totalJobs) {
    return 'green' as const;
  }

  return 'red' as const;
};

const getJobStatusClassName = (job: ScheduledReportJob) => {
  if (job.exists && job.isEnabled) {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (job.exists) {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-rose-100 text-rose-800';
};

const getJobStatusLabel = (job: ScheduledReportJob, t: Translator) => {
  if (job.exists && job.isEnabled) {
    return t('admin_job_active');
  }

  if (job.exists) {
    return t('admin_job_disabled');
  }

  return t('admin_job_missing');
};

export const AdminDashboard = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const request = useMemo(() => toDateRange(from, to), [from, to]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard', request],
    queryFn: ({ queryKey }) => getAdminDashboard(queryKey[1] as DateRangeFilter),
  });

  const {
    data: diagnostics,
    isLoading: isDiagnosticsLoading,
    error: diagnosticsError,
    isFetching: isDiagnosticsFetching,
  } = useQuery({
    queryKey: ['reportDiagnostics'],
    queryFn: getReportDiagnostics,
  });

  const { mutate: runManualSchedule, isPending: isScheduling } = useMutation({
    mutationFn: triggerManualReportScheduling,
    onSuccess: (response) => {
      setFeedback({
        type: response.success ? 'success' : 'error',
        message: response.details || response.message,
      });
      queryClient.invalidateQueries({ queryKey: ['reportDiagnostics'] });
    },
    onError: () => {
      setFeedback({
        type: 'error',
        message: 'No se pudo ejecutar la reprogramacion manual de los reportes.',
      });
    },
  });

  const diagnosticsTone = getDiagnosticsTone(diagnostics);
  const missingJobs = Math.max((diagnostics?.totalJobs ?? 0) - (diagnostics?.existingJobs ?? 0), 0);

  return (
    <section className="app-page fade-in-up">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title">{t('admin_title')}</h1>
          <p className="page-subtitle">{t('admin_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="text-sm text-gray-600">
            {t('admin_from')}
            <input
              type="date"
              className="field-modern mt-1"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          <label className="text-sm text-gray-600">
            {t('admin_to')}
            <input
              type="date"
              className="field-modern mt-1"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          className="mb-4"
          onClose={() => setFeedback(null)}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-gray-600">{t('admin_loading')}</p>
      ) : error ? (
        <Alert type="error" message={t('admin_error_metrics')} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DashboardCard title={t('admin_total_requests')} value={data?.totalRequests ?? 0} color="neutral">
              <i className="fas fa-network-wired" />
            </DashboardCard>
            <DashboardCard title={t('admin_total_errors')} value={data?.totalErrors ?? 0} color="red">
              <i className="fas fa-triangle-exclamation" />
            </DashboardCard>
            <DashboardCard
              title={t('admin_error_rate')}
              value={`${(((data?.totalErrors ?? 0) / Math.max(data?.totalRequests ?? 1, 1)) * 100).toFixed(2)}%`}
              color="green"
            >
              <i className="fas fa-chart-pie" />
            </DashboardCard>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <DashboardCard
              title={t('admin_scheduled_jobs')}
              value={`${diagnostics?.existingJobs ?? 0}/${diagnostics?.totalJobs ?? 0}`}
              color={diagnosticsTone}
            >
              <i className="fas fa-calendar-check" />
            </DashboardCard>
            <DashboardCard title={t('admin_pending_jobs')} value={missingJobs} color={missingJobs > 0 ? 'red' : 'green'}>
              <i className="fas fa-calendar-xmark" />
            </DashboardCard>
            <DashboardCard title={t('admin_timezone')} value={diagnostics?.timeZone ?? '-'} color="neutral">
              <i className="fas fa-clock" />
            </DashboardCard>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="soft-card rounded-2xl p-5 xl:col-span-1">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('admin_scheduled_reports')}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {t('admin_scheduled_reports_desc')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-modern btn-secondary"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['reportDiagnostics'] })}
                    disabled={isDiagnosticsFetching || isScheduling}
                  >
                    {isDiagnosticsFetching ? t('admin_updating') : t('admin_refresh')}
                  </button>
                  <button
                    type="button"
                    className="btn-modern btn-primary"
                    onClick={() => runManualSchedule()}
                    disabled={isScheduling}
                  >
                    {isScheduling ? t('admin_rescheduling') : t('admin_reschedule')}
                  </button>
                </div>
              </div>

              {isDiagnosticsLoading ? (
                <p className="text-sm text-gray-600">{t('admin_loading_diagnostics')}</p>
              ) : diagnosticsError ? (
                <Alert
                  type="error"
                  message={t('admin_error_diagnostics')} 
                />
              ) : (
                <>
                  <Alert
                    type={missingJobs > 0 ? 'warning' : 'success'}
                    message={diagnostics?.message ?? 'Sin informacion de diagnostico.'}
                    className="mb-4"
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Weekly day</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{diagnostics?.weeklyDay ?? '-'}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Monthly day</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{diagnostics?.monthlyDay ?? '-'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="soft-card rounded-2xl p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('admin_configured_jobs')}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {t('admin_configured_jobs_desc')}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {diagnostics?.jobs.length ?? 0} items
                </span>
              </div>

              {isDiagnosticsLoading ? (
                <p className="text-sm text-gray-600">{t('admin_loading_jobs')}</p>
              ) : diagnosticsError ? (
                <Alert type="error" message={t('admin_error_jobs')} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-modern min-w-[760px]">
                    <thead>
                      <tr>
                        <th className="text-left">{t('admin_col_function')}</th>
                        <th className="text-left">{t('admin_col_status')}</th>
                        <th className="text-left">{t('admin_col_expression')}</th>
                        <th className="text-left">{t('admin_col_description')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(diagnostics?.jobs ?? []).map((job) => (
                        <tr key={job.id}>
                          <td className="text-sm text-gray-800">
                            <div className="font-semibold">{job.function}</div>
                            <div className="text-xs text-gray-500">{job.id}</div>
                          </td>
                          <td className="text-sm">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getJobStatusClassName(job)}`}>
                              {getJobStatusLabel(job, t)}
                            </span>
                          </td>
                          <td className="text-sm text-gray-600">{job.expression}</td>
                          <td className="max-w-96 text-sm text-gray-600">{job.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="soft-card rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('admin_logs_by_level')}</h2>
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
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('admin_top_endpoints')}</h2>
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
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('admin_recent_errors')}</h2>
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th className="text-left">{t('admin_col_date')}</th>
                      <th className="text-left">{t('admin_col_message')}</th>
                      <th className="text-left">{t('admin_col_endpoint')}</th>
                      <th className="text-left">{t('admin_col_user')}</th>
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