import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useRedux'
import { useAppSelector } from '../../hooks/useRedux'
import { fetchAssignments } from '../../features/assignments/assignmentsSlice'
import { logoutThunk } from '../../features/auth/authSlice'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { QUERY } from '../../constants/query'
import type { Difficulty } from '../../constants/query'
import AssignmentCard from '../../components/assignments/AssignmentCard'
import FilterBar from '../../components/assignments/FilterBar'
import './AssignmentListPage.scss'

export default function AssignmentListPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { username } = useAuth()
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

    const handleLogout = async () => {
        await dispatch(logoutThunk())
        navigate(ROUTES.LOGIN)
    }

    return (
        <div className="list-page">
            <header className="list-header">
                <div className="container list-header-inner">
                    <div className="list-brand">
                        <span className="list-logo">S</span>
                        <span className="list-logo-text">SQL Editor</span>
                    </div>
                    <div className="list-user">
                        <span className="list-username">{username}</span>
                        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </header>

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

                {pagination && pagination.totalPages > 1 && (
                    <div className="list-pagination">
                        <button
                            className="btn btn-ghost btn-sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Prev
                        </button>
                        <span className="list-page-info">{page} / {pagination.totalPages}</span>
                        <button
                            className="btn btn-ghost btn-sm"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
