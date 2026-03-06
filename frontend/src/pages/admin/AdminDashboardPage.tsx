import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { fetchSummary } from '../../features/admin/adminSlice'
import { ROUTES } from '../../constants/routes'
import './AdminDashboard.scss'

export default function AdminDashboardPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { summary, loading, error } = useAppSelector((s) => s.admin)

    useEffect(() => {
        dispatch(fetchSummary())
    }, [dispatch])

    if (loading && !summary) return <div className="admin-loading">Loading summary...</div>
    if (error) return <div className="admin-error">{error}</div>

    return (
        <div className="admin-dashboard container">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back, Administrator</p>
            </header>

            <div className="admin-stats">
                <div className="stat-card">
                    <span className="stat-value">{summary?.totalUsers || 0}</span>
                    <span className="stat-label">Total Users</span>
                </div>
                <div className="stat-card" onClick={() => navigate(ROUTES.ADMIN_ASSIGNMENTS)}>
                    <span className="stat-value">{summary?.totalAssignments || 0}</span>
                    <span className="stat-label">Assignments</span>
                    <button className="btn btn-ghost btn-xs">Manage &rarr;</button>
                </div>
                <div className="stat-card" onClick={() => navigate(ROUTES.ADMIN_TESTCASES)}>
                    <span className="stat-value">{summary?.totalTestcases || 0}</span>
                    <span className="stat-label">Testcases</span>
                    <button className="btn btn-ghost btn-xs">Manage &rarr;</button>
                </div>
            </div>

            <section className="admin-actions">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <div className="action-card" onClick={() => navigate(ROUTES.ADMIN_ASSIGNMENTS)}>
                        <div className="action-icon">📝</div>
                        <h3>Create Assignment</h3>
                        <p>Add a new SQL challenge to the system</p>
                    </div>
                    <div className="action-card" onClick={() => navigate(ROUTES.ADMIN_TESTCASES)}>
                        <div className="action-icon">🧪</div>
                        <h3>New Testcase</h3>
                        <p>Create a reusable testcase for grading</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
