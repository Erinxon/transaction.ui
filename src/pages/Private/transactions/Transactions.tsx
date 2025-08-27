import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { TransactionRequest, TransactionResponse } from "../../../core/transactions/types/transaction.types"
import { deleteTransaction, getAllTransactions } from "../../../core/transactions/services/transactionApi"
import { SkeletonRow } from "../../../components/SkeletonRow"
import { Alert, ConfirmDialog, Modal, NotSort } from "../../../components"
import FormattedNumber from "../../../components/FormattedNumber"
import Pagination from "../../../components/Pagination"
import { useState } from "react"
import type { DashboardFilter } from "../../../core/dashboard/types/dashboard.types"
import { AdvancedFilterModal } from "../../../components/AdvancedFilterModal"
import { useModalContext } from "../../../components/Modal/context"
import { AddTransaction } from "./components/AddTransaction"
import { getAllCategories } from "../../../core/Category/services/categoryApi"

export const Transactions = () => {
    const queryClient = useQueryClient();
    const { setIsOpen } = useModalContext();
    const [currentModal, setCurrentModal] = useState<'add' | 'filter' | 'delete'>('add');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [transactionResponse, setTransactionResponse] = useState<TransactionResponse | null>(null);

    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('descending');

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

    const { isLoading, error, data } = useQuery({
        queryKey: ["allTransactions", { ...filters, page, pageSize: perPage, sortField, sortDirection }],
        queryFn: ({ queryKey }) => getAllTransactions(queryKey[1] as TransactionRequest),
    })

    const { mutate: muteteDelete } = useMutation({
        mutationFn: deleteTransaction
    });

    const reload = () => {
        queryClient.invalidateQueries({
            queryKey: ["allTransactions"],
            exact: false
        });
    }

    const { data: categories } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(),
    })

    const handleFiltersChange = (newFilters: DashboardFilter) => {
        setFilters(newFilters)
    }

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => (prev === 'ascending' ? 'descending' : 'ascending'));
        } else {
            setSortField(field);
            setSortDirection('ascending');
        }
    };

    const handleAdd = () => {
        handleShowModal('add');
        setTransactionResponse(null);
    }

    const handleShowModal = (modal: 'add' | 'filter' | 'delete') => {
        setCurrentModal(modal)
        setIsOpen(true)
    }

    const handleOnSuccess = () => {
        reload();
        setIsOpen(false);
        setTransactionResponse(null);
    }

    const handleEdit = (data: TransactionResponse) => {
        setTransactionResponse(data);
        handleShowModal('add');
    }

    const handleDelete = (data: TransactionResponse) => {
        handleShowModal('delete');
        setTransactionResponse(data);
    }

    const handleConfirmDelete = () => {
        if (transactionResponse?.id) {
            muteteDelete(transactionResponse.id, {
                onSuccess: () => {
                    reload();
                }
            })
        }
    }

    const handleInputChange = (name: keyof DashboardFilter, value: string | number | null) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value === "" ? null : value,
        }))
    }

    return (
        <>
            <div className="ml-64 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleAdd()} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer">
                            <i className="fas fa-plus mr-2"></i> Add Transaction
                        </button>
                        <button className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer">
                            <i className="fas fa-file-export mr-2"></i> Export
                        </button>
                        <button className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer">
                            <i className="fas fa-file-import mr-2"></i> Import
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex flex-wrap items-center gap-4 mb-4 md:mb-0">
                            <div>
                                <label htmlFor="transaction-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select id="transaction-type" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={filters.transactionTypeId || ""}
                                    onChange={(e) => handleInputChange("transactionTypeId", e.target.value)}>
                                    <option value="">Todo</option>
                                    <option value={1}>Ingreso</option>
                                    <option value={2}>Gasto</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select id="category" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={filters.categoryId || ""}
                                    onChange={(e) => handleInputChange("categoryId", e.target.value)}>
                                    <option key={0} value="">Todo</option>
                                    {categories?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button id="advanced-filter-toggle" className="text-emerald-600 hover:text-emerald-700 flex items-center cursor-pointer"
                                onClick={() => handleShowModal('filter')}>
                                <i className="fas fa-filter mr-2"></i> Advanced Filters
                            </button>
                        </div>
                    </div>
                </div>

                {
                    /*
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex justify-end">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">View:</span>
                                    <button className="bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" id="list-view-btn">
                                        <i className="fas fa-list"></i>
                                    </button>
                                    <button className="bg-white text-gray-700 p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" id="grid-view-btn">
                                        <i className="fas fa-th-large"></i>
                                    </button>
                                    <button className="bg-white text-gray-700 p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" id="calendar-view-btn">
                                        <i className="fas fa-calendar-alt"></i>
                                    </button>
                                </div>
                            </div>
                         </div>
                    */
                }


                <div id="list-view" className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    onClick={() => handleSort('Date')}
                                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Date {sortField === 'Date' && (sortDirection === 'ascending' ? '▲' : '▼')}
                                    {sortField !== 'Date' && <NotSort />}
                                </th>
                                <th
                                    onClick={() => handleSort('Category')}
                                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Category {sortField === 'Category' && (sortDirection === 'ascending' ? '▲' : '▼')}
                                    {sortField !== 'Category' && <NotSort />}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Comment
                                </th>
                                <th
                                    onClick={() => handleSort('Amount')}
                                    className="cursor-pointer px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Amount {sortField === 'Amount' && (sortDirection === 'ascending' ? '▲' : '▼')}
                                    {sortField !== 'Amount' && <NotSort />}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <SkeletonRow quantity={5} />
                            ) : error ? (
                                <tr>
                                    <td className="text-red-500 text-center" colSpan={5}>
                                        <Alert type="error" message="Error cargando transacciones" />
                                    </td>
                                </tr>
                            ) : (
                                (data?.items ?? [])?.map((x) => (

                                    <tr key={x.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(x.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${x.transactionTypeId === 1 ? "green" : "red"}-100 text-${x.transactionTypeId === 1 ? "green" : "red"}-800`}>{x.category}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{x.description}</td>
                                        <td className={`"px-6 py-4 whitespace-nowrap text-right text-sm text-${x.transactionTypeId === 1 ? "green" : "red"}-600`}><FormattedNumber value={x.amount} isAmount={true} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-emerald-600 hover:text-emerald-900 mr-3 cursor-pointer" onClick={() => handleEdit(x)}><i className="fas fa-edit"></i></button>
                                            <button className="text-red-600 hover:text-red-900 cursor-pointer" onClick={() => handleDelete(x)}><i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <Pagination
                        currentPage={page}
                        totalItems={data?.totalItems ?? 0}
                        itemsPerPage={perPage}
                        onPageChange={(newPage: number) => setPage(newPage)}
                        onItemsPerPageChange={(items: number) => setPerPage(items)}
                        perPageOptions={[5, 10, 20, 50, 100]}
                    />
                </div>

                <div id="grid-view" className="hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Groceries</span>
                                        <p className="mt-1 text-sm text-gray-500">May 10, 2025</p>
                                    </div>
                                    <span className="text-lg font-semibold text-red-600">-$120.50</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-700">Weekly shopping at Walmart</p>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right">
                                <button className="text-emerald-600 hover:text-emerald-900 mr-3"><i className="fas fa-edit"></i></button>
                                <button className="text-red-600 hover:text-red-900"><i className="fas fa-trash"></i></button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Salary</span>
                                        <p className="mt-1 text-sm text-gray-500">May 8, 2025</p>
                                    </div>
                                    <span className="text-lg font-semibold text-green-600">+$3,500.00</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-700">Monthly salary payment</p>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right">
                                <button className="text-emerald-600 hover:text-emerald-900 mr-3"><i className="fas fa-edit"></i></button>
                                <button className="text-red-600 hover:text-red-900"><i className="fas fa-trash"></i></button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Utilities</span>
                                        <p className="mt-1 text-sm text-gray-500">May 5, 2025</p>
                                    </div>
                                    <span className="text-lg font-semibold text-red-600">-$85.20</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-700">Electricity bill payment</p>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right">
                                <button className="text-emerald-600 hover:text-emerald-900 mr-3"><i className="fas fa-edit"></i></button>
                                <button className="text-red-600 hover:text-red-900"><i className="fas fa-trash"></i></button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Dining</span>
                                        <p className="mt-1 text-sm text-gray-500">May 2, 2025</p>
                                    </div>
                                    <span className="text-lg font-semibold text-red-600">-$64.30</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-700">Dinner at Italian restaurant</p>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right">
                                <button className="text-emerald-600 hover:text-emerald-900 mr-3"><i className="fas fa-edit"></i></button>
                                <button className="text-red-600 hover:text-red-900"><i className="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Previous</span>
                                <i className="fas fa-chevron-left"></i>
                            </a>
                            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-emerald-50 text-sm font-medium text-emerald-600 hover:bg-emerald-100">1</a>
                            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</a>
                            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</a>
                            <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span className="sr-only">Next</span>
                                <i className="fas fa-chevron-right"></i>
                            </a>
                        </nav>
                    </div>
                </div>

                <div id="calendar-view" className="hidden bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">May 2025</h2>
                        <div className="flex space-x-2">
                            <button className="p-1 rounded-md hover:bg-gray-100">
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button className="p-1 rounded-md hover:bg-gray-100">
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        <div className="text-center font-medium text-gray-500 text-sm py-2">Sun</div>
                        <div className="text-center font-medium text-gray-500 text-sm py-2">Mon</div>
                        <div className="text-center font-medium text-gray-500 text-sm py-2">Tue</div>
                        <div className="text-center font-medium text-gray-500 text-sm py-2">Wed</div>
                        <div className="text-center font-medium text-gray-500 text-sm py-2">Thu</div>
                        <div className="text-center font-medium text-gray-500 text-sm py-2">Fri</div>
                        <div className="text-center font-medium text-gray-500 text-sm py-2">Sat</div>

                        <div className="text-center text-gray-400 p-2 border rounded-md">28</div>
                        <div className="text-center text-gray-400 p-2 border rounded-md">29</div>
                        <div className="text-center text-gray-400 p-2 border rounded-md">30</div>
                        <div className="text-center p-2 border rounded-md">1</div>
                        <div className="text-center p-2 border rounded-md relative">
                            2
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                            </div>
                        </div>
                        <div className="text-center p-2 border rounded-md">3</div>
                        <div className="text-center p-2 border rounded-md">4</div>

                        <div className="text-center p-2 border rounded-md relative">
                            5
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                            </div>
                        </div>
                        <div className="text-center p-2 border rounded-md">6</div>
                        <div className="text-center p-2 border rounded-md">7</div>
                        <div className="text-center p-2 border rounded-md relative">
                            8
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                            </div>
                        </div>
                        <div className="text-center p-2 border rounded-md">9</div>
                        <div className="text-center p-2 border rounded-md relative">
                            10
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                            </div>
                        </div>
                        <div className="text-center p-2 border rounded-md">11</div>

                        <div className="text-center p-2 border rounded-md">12</div>
                        <div className="text-center p-2 border rounded-md">13</div>
                        <div className="text-center p-2 border rounded-md">14</div>
                        <div className="text-center p-2 border rounded-md">15</div>
                        <div className="text-center p-2 border rounded-md">16</div>
                        <div className="text-center p-2 border rounded-md">17</div>
                        <div className="text-center p-2 border rounded-md">18</div>

                        <div className="text-center p-2 border rounded-md">19</div>
                        <div className="text-center p-2 border rounded-md">20</div>
                        <div className="text-center p-2 border rounded-md">21</div>
                        <div className="text-center p-2 border rounded-md">22</div>
                        <div className="text-center p-2 border rounded-md">23</div>
                        <div className="text-center p-2 border rounded-md">24</div>
                        <div className="text-center p-2 border rounded-md">25</div>

                        <div className="text-center p-2 border rounded-md">26</div>
                        <div className="text-center p-2 border rounded-md">27</div>
                        <div className="text-center p-2 border rounded-md">28</div>
                        <div className="text-center p-2 border rounded-md">29</div>
                        <div className="text-center p-2 border rounded-md">30</div>
                        <div className="text-center p-2 border rounded-md">31</div>
                        <div className="text-center text-gray-400 p-2 border rounded-md">1</div>
                    </div>

                    <div className="mt-4 flex items-center justify-end space-x-4">
                        <div className="flex items-center">
                            <span className="h-3 w-3 bg-red-500 rounded-full mr-2"></span>
                            <span className="text-sm text-gray-600">Expense</span>
                        </div>
                        <div className="flex items-center">
                            <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-sm text-gray-600">Income</span>
                        </div>
                    </div>
                </div>



            </div>

            {currentModal === 'add' &&
                <Modal title={`${transactionResponse?.id ? 'Edit' : 'Add'} Transaction`} disableClickOutside={true}>
                    <AddTransaction data={transactionResponse} onSuccess={handleOnSuccess} />
                </Modal>
            }

            {currentModal === 'filter' && <AdvancedFilterModal filters={filters} onFiltersChange={handleFiltersChange} />}

            {currentModal === 'delete' && <ConfirmDialog
                title="Eliminar elemento"
                description="¿Estás seguro de que quieres eliminar este elemento?"
                onConfirm={handleConfirmDelete}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
            />}
        </>
    )
}