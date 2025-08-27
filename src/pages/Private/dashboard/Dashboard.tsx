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
      <div className="ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avanzados
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">Welcome, User</span>
              <img src="https://avatar.iran.liara.run/public/15" alt="Profile" className="w-10 h-10 rounded-full" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SkeletonCard quantity={3} />
          </div>
        ) : error ? (
          <div className="text-red-500">Error loading data</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <DashboardCard
                title="Balance Total  (Aproximado)"
                value={<FormattedNumber value={((data?.income ?? 0) - (data?.expenses ?? 0))} isAmount={true} />}
                color="green"
              >
                <i className="fas fa-wallet text-emerald-600"></i>
              </DashboardCard>
              <DashboardCard title="Ingresos" value={<FormattedNumber value={data?.income ?? 0} isAmount={true} />} color="green">
                <i className="fas fa-arrow-up text-green-600"></i>
              </DashboardCard>
              <DashboardCard title="Gastos" value={<FormattedNumber value={data?.expenses ?? 0} isAmount={true} />} color="red">
                <i className="fas fa-arrow-down text-red-600"></i>
              </DashboardCard>
            </div>
          </>
        )}

        <div className="grid grid-cols-2  gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Transactions</h2>
            </div>
            {
              isLoadingYearly ? <ChartSkeleton /> :
                errorYearly ? <Alert type="error" message="Error cargando transacciones" />
                  : <DashboardYearly data={yearlyData ?? []} />
            }
          </div>


          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
              <a onClick={navigateToList} className="text-sm text-emerald-600 hover:text-emerald-500 cursor-pointer">
                View All
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(x.date).toLocaleDateString()}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm bg-text-${x.transactionTypeId === 1 ? "green" : "red"}-100 text-${x.transactionTypeId === 1 ? "green" : "red"}-600`}
                        >
                          {x.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{x.description}</td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-${x.transactionTypeId === 1 ? "green" : "red"}-600`}
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

      </div>

      <AdvancedFilterModal filters={filters} onFiltersChange={handleFiltersChange} />
    </>
  )
}
