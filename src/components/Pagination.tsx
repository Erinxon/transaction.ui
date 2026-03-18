interface Props {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (newPage: number) => void;
    onItemsPerPageChange: (items: number) => void;
    perPageOptions?: number[];
}

const Pagination = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    perPageOptions = [5, 10, 20, 50, 100],
}: Props) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const maxVisiblePages = 5;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= maxVisiblePages + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            pages.push(1); // First

            if (start > 2) pages.push("...");

            for (let i = start; i <= end; i++) pages.push(i);

            if (end < totalPages - 1) pages.push("...");

            pages.push(totalPages); // Last
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="border-t border-gray-200/70 bg-white/80 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>
                        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
                        <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
                        <span className="font-semibold text-gray-900">{totalItems}</span> results
                    </span>
                    <label className="flex items-center gap-1">
                        Rows per page:
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                            className="select-modern max-w-20 py-1"
                        >
                            {perPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div>
                    <nav
                        className="relative z-0 inline-flex -space-x-px rounded-xl border border-gray-200 bg-white shadow-sm"
                        aria-label="Pagination"
                    >
                        <button
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className={`relative inline-flex items-center rounded-l-xl border-r border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 ${currentPage > 1 ? 'cursor-pointer' : ''}`}
                        >
                            <span className="sr-only">Previous</span>
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        {getPageNumbers().map((page, index) =>
                            typeof page === "number" ? (
                                <button
                                    key={index}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center border-r border-gray-200 px-4 py-2 text-sm font-medium ${
                                        page === currentPage
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                                    }`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span
                                    key={index}
                                    className="inline-flex items-center border-r border-gray-200 bg-white px-3 py-2 text-sm text-gray-500"
                                >
                                    ...
                                </span>
                            )
                        )}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            className={`relative inline-flex items-center rounded-r-xl bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 ${currentPage !== totalPages ? 'cursor-pointer' : ''}`}
                        >
                            <span className="sr-only">Next</span>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;