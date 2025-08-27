import { useState, useRef, useEffect } from "react"
import { Filter, Calendar, DollarSign, FileText, Tag, ArrowRightLeft } from "lucide-react"
import type { DashboardFilter } from "../core/dashboard/types/dashboard.types"
import { useModalContext } from "./Modal/context"
import { Modal } from "./Modal/Modal"
import { useQuery } from "@tanstack/react-query"
import { getAllCategories } from "../core/Category/services/categoryApi"

interface AdvancedFilterModalProps {
  filters: DashboardFilter
  onFiltersChange: (filters: DashboardFilter) => void
}

const dateRangeList: { key: string, name: string }[] = [
  { key: 'all', name: 'Todo' },
  { key: 'today', name: 'Hoy' },
  { key: 'last_day', name: 'Última dia' },
  { key: 'last_7d', name: 'Últimos 7 días' },
  { key: 'last_4w', name: 'Últimas 4 semanas' },
  { key: 'this_month', name: 'Este mes' },
  { key: 'last_3_months', name: 'Últimos 3 meses' },
  { key: 'date_range', name: 'Rango de fechas' }
]

export const AdvancedFilterModal = ({ filters, onFiltersChange }: AdvancedFilterModalProps) => {
  const [localFilters, setLocalFilters] = useState<DashboardFilter>(filters)
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const { isOpen, setIsOpen } = useModalContext();

  const { data: categories } = useQuery({
    queryKey: ["allCategories"],
    queryFn: () => getAllCategories(),
  })

  const handleInputChange = (name: keyof DashboardFilter, value: string | number | null) => {
    console.log(name, value)
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const emptyFilters: DashboardFilter = {
      minAmount: null,
      maxAmount: null,
      dateRange: 'all',
      startDate: null,
      endDate: null,
      description: null,
      transactionTypeId: null,
      categoryId: null,
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value !== null && value !== "" && value != "all" && value != "date_range").length
  }

  const activeFiltersCount = getActiveFiltersCount()

  const getTransactionTypeLabel = () => {
    if (localFilters.transactionTypeId === 1) return "Ingreso"
    if (localFilters.transactionTypeId === 2) return "Gasto"
    return "Seleccionar tipo..."
  }

  useEffect(() => {
    if (isOpen) {
      setIsSelectOpen(false);
    }
  }, [isOpen])

  return (
    <>
      <Modal title="Filtros Avanzados"
        icon={<Filter className="w-5 h-5 text-blue-600 mr-2" />}
        description="Personaliza los filtros para encontrar exactamente lo que buscas">
        <>
          <div>
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 text-gray-500 mr-2" />
                Descripción
              </label>
              <input
                type="text"
                placeholder="Buscar por descripción..."
                value={localFilters.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="mt-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                Rango de Montos
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Monto mínimo</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={localFilters.minAmount || ""}
                    onChange={(e) => handleInputChange("minAmount", e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Monto máximo</label>
                  <input
                    type="number"
                    placeholder="999999.99"
                    value={localFilters.maxAmount || ""}
                    onChange={(e) => handleInputChange("maxAmount", e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 mt-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                Periodo predefinido
              </label>
              <div className="space-y-2">
                <select id="date-range-preset" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={localFilters.dateRange || ""}
                  onChange={(e) => handleInputChange("dateRange", e.target.value)}>
                  {dateRangeList?.map((dataRange) => <option key={dataRange.key} value={dataRange.key}>{dataRange.name}</option>)}
                </select>
              </div>
            </div>
            {/* Rango de fechas */}
            {(localFilters.dateRange == 'date_range' || localFilters.dateRange == 'all') &&
              <div className="mt-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  Rango de Fechas
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Fecha inicio</label>
                    <input
                      type="date"
                      value={localFilters.startDate || ""}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Fecha fin</label>
                    <input
                      type="date"
                      value={localFilters.endDate || ""}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            }

            {/* Tipo de transacción */}
            <div className="space-y-1 mt-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <ArrowRightLeft className="w-4 h-4 text-gray-500 mr-2" />
                Tipo de Transacción
              </label>
              <div className="relative" ref={selectRef}>
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <span className="block truncate">{getTransactionTypeLabel()}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>

                {isSelectOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                    <div
                      onClick={() => {
                        handleInputChange("transactionTypeId", null)
                        setIsSelectOpen(false)
                      }}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    >
                      <span className="block truncate">Todos los tipos</span>
                    </div>
                    <div
                      onClick={() => {
                        handleInputChange("transactionTypeId", 1)
                        setIsSelectOpen(false)
                      }}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="block truncate">Ingreso</span>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        handleInputChange("transactionTypeId", 2)
                        setIsSelectOpen(false)
                      }}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="block truncate">Gasto</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 mt-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Tag  className="w-4 h-4 text-gray-500 mr-2" />
                Categoría
              </label>
              <div className="space-y-2">
                <select id="categoryId" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={localFilters.categoryId || ""}
                  onChange={(e) => handleInputChange("categoryId", e.target.value)}>
                    <option key={0} value="">Todo</option>
                  {categories?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
            </div>

            {/* Filtros activos */}
            {activeFiltersCount > 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">
                    {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""} activo
                    {activeFiltersCount > 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded transition-colors duration-200"
                  >
                    Limpiar todo
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
            >
              Aplicar Filtros
            </button>
          </div>
        </>
      </Modal>
    </>
  )
}
