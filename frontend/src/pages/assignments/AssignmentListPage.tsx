import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../hooks/useRedux'
import { useAppSelector } from '../../hooks/useRedux'
import { fetchAssignments } from '../../features/assignments/assignmentsSlice'
import { QUERY } from '../../constants/query'
import type { Difficulty } from '../../constants/query'
import AssignmentCard from '../../components/assignments/AssignmentCard'
import FilterBar from '../../components/assignments/FilterBar'
import Pagination from '../../components/common/Pagination'
import './AssignmentListPage.scss'

export default function AssignmentListPage() {
    const dispatch = useAppDispatch()
    const { list, pagination, loading, error } = useAppSelector((s) => s.assignments)

    const [difficulty, setDifficulty] = useState<Difficulty | ''>('')
    const [page, setPage] = useState<number>(QUERY.DEFAULT_PAGE)

    useEffect(() => {
        dispatch(fetchAssignments({ page, difficulty: difficulty || undefined, limit: QUERY.DEFAULT_LIMIT }))
    }, [dispatch, page, difficulty])

    const handleDifficultyChange = (d: Difficulty | '') => {
        setDifficulty(d)
        setPage(1)
    }

    return (
        <div className="list-page">
            <main className="container list-main">
                <div className="list-hero">
                    <h1>SQL Assignments</h1>
                    <p>Practice SQL queries with real-time execution and intelligent hints.</p>
                </div>

                <div className="list-controls">
                    <FilterBar selected={difficulty} onChange={handleDifficultyChange} />
                </div>

                {loading && list.length === 0 && (
                    <div className="list-loading">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="list-skeleton" />
                        ))}
                    </div>
                )}

                {error && <p className="list-error">{error}</p>}

                {!loading && !error && list.length === 0 && (
                    <div className="list-empty">
                        <span>-</span>
                        <p>No assignments found for this filter.</p>
                    </div>
                )}

                {!error && list.length > 0 && (
                    <div className={`list-grid ${loading ? 'is-loading' : ''}`}>
                        {list.map((a) => <AssignmentCard key={a._id} assignment={a} />)}
                    </div>
                )}

                <Pagination
                    currentPage={page}
                    totalPages={pagination?.totalPages || 0}
                    onPageChange={setPage}
                    loading={loading}
                    className="list-pagination"
                />
            </main>
        </div>
    )
}
