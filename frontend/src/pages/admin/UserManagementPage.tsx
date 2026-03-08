import { useState, useEffect, useRef } from 'react'
import { adminApi } from '../../services/adminApi'
import { QUERY } from '../../constants/query'
import { useToast } from '../../components/common/Toast'
import type { ManagedUser } from '../../types/user'
import { useAppSelector } from '../../hooks/useRedux'
import '../superadmin/AdminManagement.scss' // Reusing styles
import { superadminApi } from '../../services/superadminApi'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'

export default function UserManagementPage() {
    const [users, setUsers] = useState<ManagedUser[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { showToast } = useToast()
    const role = useAppSelector(state => (state.auth as any).role)

    // Modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        userId: string | null;
        isLoading: boolean;
        type: 'promote' | 'delete' | null;
    }>({ isOpen: false, userId: null, isLoading: false, type: null })

    const prevSearchQuery = useRef(searchQuery)

    // Consolidated effect for search and pagination
    useEffect(() => {
        const searchChanged = prevSearchQuery.current !== searchQuery
        prevSearchQuery.current = searchQuery

        const delay = searchChanged ? QUERY.DEBOUNCE_DELAY.SEARCH : 0

        const timer = setTimeout(() => {
            fetchUsers(currentPage, searchQuery)
        }, delay)

        return () => clearTimeout(timer)
    }, [searchQuery, currentPage])

    // Reset to page 1 when search changes
    useEffect(() => {
        if (searchQuery) {
            setCurrentPage(1)
        }
    }, [searchQuery])

    const fetchUsers = async (page: number, q: string) => {
        setLoading(true)
        try {
            if (q.trim().length >= QUERY.SEARCH_THRESHOLD) {
                // Use search endpoint (non-paginated results)
                const res = await adminApi.searchUsers(q)
                // Search endpoint currently returns { data: [] }
                setUsers((res.data as any).data || res.data)
                setTotalPages(1)
                setCurrentPage(1)
            } else {
                // Use standard pagination
                const res = await adminApi.getUsers(page)
                // The paginate utility returns { data: [...], totalPages: X, ... }
                // responseHandler wraps it in another 'data' field.
                const paginatedData = (res.data as any).data
                setUsers(paginatedData.data)
                setTotalPages(paginatedData.totalPages || 1)
                setCurrentPage(paginatedData.page || 1)
            }
        } catch {
            showToast('Failed to load users', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handlePromote = (userId: string) => {
        setConfirmModal({ isOpen: true, userId, isLoading: false, type: 'promote' })
    }

    const handleDelete = (userId: string) => {
        setConfirmModal({ isOpen: true, userId, isLoading: false, type: 'delete' })
    }

    const confirmAction = async () => {
        if (!confirmModal.userId || !confirmModal.type) return
        setConfirmModal(prev => ({ ...prev, isLoading: true }))
        try {
            if (confirmModal.type === 'promote') {
                await superadminApi.updateUserRole(confirmModal.userId, 'admin')
                showToast('User promoted to Admin')
            } else {
                await superadminApi.deleteUser(confirmModal.userId)
                showToast('User deleted successfully')
            }
            fetchUsers(currentPage, searchQuery)
            setConfirmModal({ isOpen: false, userId: null, isLoading: false, type: null })
        } catch (err: any) {
            const msg = err.response?.data?.error || `Failed to ${confirmModal.type} user`
            showToast(msg, 'error')
            setConfirmModal(prev => ({ ...prev, isLoading: false }))
        }
    }

    return (
        <div className="admin-page container">
            <header className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>View all registered users in the system</p>
                </div>
            </header>

            <div className="admin-management__search-section">
                <input
                    type="text"
                    placeholder="Search users by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-management__search-input"
                />
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Joined At</th>
                            {role === 'superadmin' && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="font-bold">{user.username}</td>
                                <td>
                                    <span className={`badge badge-${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                {role === 'superadmin' && (
                                    <td className="actions-cell">
                                        <button
                                            className="btn btn-ghost btn-xs text-primary"
                                            onClick={() => handlePromote(user._id)}
                                        >
                                            Promote
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-xs text-danger"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="loading-overlay">Loading...</div>}

                {users.length === 0 && !loading && (
                    <div className="p-8 text-center text-text-muted">
                        No users found.
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                loading={loading}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, userId: null, isLoading: false, type: null })}
                onConfirm={confirmAction}
                title={confirmModal.type === 'promote' ? "Promote User" : "Delete User"}
                message={confirmModal.type === 'promote'
                    ? "Are you sure you want to promote this user to Admin? They will have full administrative access to the platform."
                    : "Are you sure you want to delete this user? This action cannot be undone."}
                confirmText={confirmModal.type === 'promote' ? "Promote to Admin" : "Delete User"}
                isDanger={confirmModal.type === 'delete'}
                isLoading={confirmModal.isLoading}
            />
        </div>
    )
}
