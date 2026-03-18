import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { Alert, DashboardCard, DashboardYearly, SkeletonCard } from "../../../components"
import { recentTransactions, summary, yearly } from "../../../core/dashboard/services/dashboardApi"
import type { RecentTransactionRequest, DashboardFilter, ByYearRequest } from "../../../core/dashboard/types/dashboard.types"
import { SkeletonRow } from "../../../components/SkeletonRow"
import FormattedNumber from "../../../components/FormattedNumber"
import { AdvancedFilterModal } from "../../../components/AdvancedFilterModal"
import ChartSkeleton from "../../../components/ChartSkeleton"
import { useNavigate } from "react-router-dom"
import { useModalContext } from "../../../components/Modal/context"
import { Filter } from "lucide-react"

export const Dashboard = () => {
  const { setIsOpen } = useModalContext();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DashboardFilter>({
    minAmount: null,
    maxAmount: null,
    dateRange: 'all',
    startDate: null,
    endDate: null,
    description: null,
    transactionTypeId: null,
    categoryId: null
  })

  const recentRequest: RecentTransactionRequest = { count: 10 }

  const { isLoading, error, data } = useQuery({
    queryKey: ["dashboardSummary", filters],
    queryFn: ({ queryKey }) => summary(queryKey[1] as DashboardFilter),
  })

  const {
    isLoading: isLoadingTransactions,
    error: errorTransactions,
    data: transactionsData,
  } = useQuery({
    queryKey: ["recentTransactions", { ...recentRequest, ...filters }],
    queryFn: ({ queryKey }) => recentTransactions(queryKey[1] as RecentTransactionRequest),
  })

  const {
    isLoading: isLoadingYearly,
    error: errorYearly,
    data: yearlyData,
  } = useQuery({
    queryKey: ["yearly", { ...filters, year: new Date().getFullYear() }],
    queryFn: ({ queryKey }) => yearly(queryKey[1] as ByYearRequest),
  })

  const handleFiltersChange = (newFilters: DashboardFilter) => {
    setFilters(newFilters)
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value !== null && value !== "" && value != "all" && value != "date_range").length
  }

  const activeFiltersCount = getActiveFiltersCount()


  const navigateToList = () => {
    navigate('/app/transactions')
  }

  return (
    <>
      <section className="app-page fade-in-up">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Resumen en tiempo real de ingresos, gastos y movimientos recientes.</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="btn-modern btn-secondary relative inline-flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros avanzados
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SkeletonCard quantity={3} />
          </div>
        ) : error ? (
          <div className="text-red-500">Error loading data</div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <DashboardCard
                title="Balance Total  (Aproximado)"
                value={<FormattedNumber value={((data?.income ?? 0) - (data?.expenses ?? 0))} isAmount={true} />}
                color="neutral"
              >
                <i className="fas fa-wallet"></i>
              </DashboardCard>
              <DashboardCard title="Ingresos" value={<FormattedNumber value={data?.income ?? 0} isAmount={true} />} color="green">
                <i className="fas fa-arrow-up"></i>
              </DashboardCard>
              <DashboardCard title="Gastos" value={<FormattedNumber value={data?.expenses ?? 0} isAmount={true} />} color="red">
                <i className="fas fa-arrow-down"></i>
              </DashboardCard>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="soft-card rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tendencia mensual</h2>
            </div>
            {
              isLoadingYearly ? <ChartSkeleton /> :
                errorYearly ? <Alert type="error" message="Error cargando transacciones" />
                  : <DashboardYearly data={yearlyData ?? []} />
            }
          </div>


          <div className="soft-card rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Últimos movimientos</h2>
              <button onClick={navigateToList} className="btn-modern btn-ghost text-sm">
                Ver todo
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="text-left">
                      Date
                    </th>
                    <th className="text-left">
                      Category
                    </th>
                    <th className="text-left">
                      Description
                    </th>
                    <th className="text-left">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTransactions ? (
                    <SkeletonRow quantity={4} />
                  ) : errorTransactions ? (
                    <tr>
                      <td className="text-red-500 text-center" colSpan={4}>
                        <Alert type="error" message="Error cargando transacciones" />
                      </td>
                    </tr>
                  ) : (
                    (transactionsData ?? [])?.map((x) => (
                      <tr key={x.id}>
                        <td className="whitespace-nowrap text-sm text-gray-600">
                          {new Date(x.date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap text-sm">
                          <span className={`status-chip ${x.transactionTypeId === 1 ? "status-income" : "status-expense"}`}>
                            {x.category}
                          </span>
                        </td>
                        <td className="max-w-48 truncate whitespace-nowrap text-sm text-gray-600">{x.description}</td>
                        <td
                          className={`whitespace-nowrap text-sm font-semibold ${x.transactionTypeId === 1 ? "text-emerald-700" : "text-rose-700"}`}
                        >
                          <FormattedNumber value={x.amount} isAmount={true} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <AdvancedFilterModal filters={filters} onFiltersChange={handleFiltersChange} />
    </>
  )
}
