import { useState, useRef, useEffect } from "react"
import { Filter, Calendar, DollarSign, FileText, Tag, ArrowRightLeft } from "lucide-react"
import type { DashboardFilter } from "../core/dashboard/types/dashboard.types"
import { useModalContext } from "./Modal/context"
import { Modal } from "./Modal/Modal"
import { useQuery } from "@tanstack/react-query"
import { getAllCategories } from "../core/Category/services/categoryApi"
import { TransactionType } from "../core/Category/types/category.types"
import { useI18n } from "../core/i18n/useI18n"

interface AdvancedFilterModalProps {
  filters: DashboardFilter
  onFiltersChange: (filters: DashboardFilter) => void
  hideDateFilters?: boolean
}

export const AdvancedFilterModal = ({ filters, onFiltersChange, hideDateFilters = false }: AdvancedFilterModalProps) => {
  const [localFilters, setLocalFilters] = useState<DashboardFilter>(filters)
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const { isOpen, setIsOpen } = useModalContext();
  const { t } = useI18n();
  const selectedTransactionType = localFilters.transactionTypeId ? Number(localFilters.transactionTypeId) : null;

  const { data: categories } = useQuery({
    queryKey: ["allCategories", selectedTransactionType],
    queryFn: () => getAllCategories(
      selectedTransactionType ? selectedTransactionType as TransactionType : undefined,
    ),
  })

  const handleInputChange = (name: keyof DashboardFilter, value: string | number | null) => {
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
    if (localFilters.transactionTypeId === 1) return t('tx_type_income')
    if (localFilters.transactionTypeId === 2) return t('tx_type_expense')
    return t('af_select_type')
  }

  useEffect(() => {
    if (isOpen) {
      setIsSelectOpen(false);
    }
  }, [isOpen])

  useEffect(() => {
    if (!localFilters.categoryId) {
      return;
    }

    const categoryId = Number(localFilters.categoryId);
    const isValidCategory = categories?.some((category) => category.id === categoryId) ?? false;
    if (!isValidCategory) {
      setLocalFilters((prev) => ({
        ...prev,
        categoryId: null,
      }));
    }
  }, [categories, localFilters.categoryId])

  return (
    <>
      <Modal title={t('af_title')}
        icon={<Filter className="w-5 h-5 text-emerald-600 mr-2" />}
        description={t('af_description')}>
        <>
          <div>
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 text-gray-500 mr-2" />
                {t('af_description_label')}
              </label>
              <input
                type="text"
                placeholder={t('af_description_placeholder')}
                value={localFilters.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="field-modern"
              />
            </div>

            <div className="mt-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                {t('af_amount_range')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">{t('af_min_amount')}</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={localFilters.minAmount || ""}
                    onChange={(e) => handleInputChange("minAmount", e.target.value ? Number(e.target.value) : null)}
                    className="field-modern"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">{t('af_max_amount')}</label>
                  <input
                    type="number"
                    placeholder="999999.99"
                    value={localFilters.maxAmount || ""}
                    onChange={(e) => handleInputChange("maxAmount", e.target.value ? Number(e.target.value) : null)}
                    className="field-modern"
                  />
                </div>
              </div>
            </div>

            {!hideDateFilters && (
              <>
                <div className="space-y-1 mt-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    {t('af_preset_period')}
                  </label>
                  <div className="space-y-2">
                    <select id="date-range-preset" className="select-modern"
                      value={localFilters.dateRange || ""}
                      onChange={(e) => handleInputChange("dateRange", e.target.value)}>
                      <option value="all">{t('dr_all')}</option>
                      <option value="today">{t('dr_today')}</option>
                      <option value="last_day">{t('dr_last_day')}</option>
                      <option value="last_7d">{t('dr_last_7d')}</option>
                      <option value="last_4w">{t('dr_last_4w')}</option>
                      <option value="this_month">{t('dr_this_month')}</option>
                      <option value="last_3_months">{t('dr_last_3_months')}</option>
                      <option value="date_range">{t('dr_date_range')}</option>
                    </select>
                  </div>
                </div>
                {(localFilters.dateRange == 'date_range' || localFilters.dateRange == 'all') &&
                  <div className="mt-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      {t('af_date_range')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">{t('af_start_date')}</label>
                        <input
                          type="date"
                          value={localFilters.startDate || ""}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          className="field-modern"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">{t('af_end_date')}</label>
                        <input
                          type="date"
                          value={localFilters.endDate || ""}
                          onChange={(e) => handleInputChange("endDate", e.target.value)}
                          className="field-modern"
                        />
                      </div>
                    </div>
                  </div>
                }
              </>
            )}

            {/* Tipo de transacción */}
            <div className="space-y-1 mt-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <ArrowRightLeft className="w-4 h-4 text-gray-500 mr-2" />
                {t('af_tx_type')}
              </label>
              <div className="relative" ref={selectRef}>
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="field-modern text-left"
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
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                    <div
                      onClick={() => {
                        handleInputChange("transactionTypeId", null)
                        setIsSelectOpen(false)
                      }}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    >
                      <span className="block truncate">{t('af_all_types')}</span>
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
                        <span className="block truncate">{t('tx_type_income')}</span>
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
                        <span className="block truncate">{t('tx_type_expense')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 mt-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Tag  className="w-4 h-4 text-gray-500 mr-2" />
                {t('af_category')}
              </label>
              <div className="space-y-2">
                <select id="categoryId" className="select-modern"
                  value={localFilters.categoryId || ""}
                  onChange={(e) => handleInputChange("categoryId", e.target.value ? Number(e.target.value) : null)}>
                    <option key={0} value="">{t('tx_filter_all')}</option>
                  {categories?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
            </div>

            {/* Filtros activos */}
            {activeFiltersCount > 0 && (
              <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800">
                    {activeFiltersCount === 1 ? t('af_active_one') : t('af_active_many', { n: activeFiltersCount })}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 px-2 py-1 rounded transition-colors duration-200"
                  >
                    {t('af_clear_all')}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsOpen(false)}
              className="btn-modern btn-secondary"
            >
              {t('af_cancel')}
            </button>
            <button
              onClick={applyFilters}
              className="btn-modern btn-primary"
            >
              {t('af_apply')}
            </button>
          </div>
        </>
      </Modal>
    </>
  )
}
