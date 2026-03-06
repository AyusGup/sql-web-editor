import './Pagination.scss'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    loading?: boolean
    className?: string
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    loading = false,
    className = ""
}: PaginationProps) {
    if (totalPages <= 1) return null

    return (
        <div className={`pagination-bar ${className}`}>
            <button
                className="btn btn-ghost btn-xs"
                disabled={currentPage <= 1 || loading}
                onClick={() => onPageChange(currentPage - 1)}
            >
                ← Prev
            </button>
            <span className="pagination-bar__info">
                Page {currentPage} of {totalPages}
            </span>
            <button
                className="btn btn-ghost btn-xs"
                disabled={currentPage >= totalPages || loading}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next →
            </button>
        </div>
    )
}
