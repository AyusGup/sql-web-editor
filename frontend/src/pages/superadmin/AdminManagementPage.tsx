import { useState, useEffect } from 'react'
import { superadminApi } from '../../services/superadminApi'
import { useToast } from '../../components/common/Toast'
import type { ManagedUser } from '../../types/user'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import './AdminManagement.scss'

export default function AdminManagementPage() {
    const [admins, setAdmins] = useState<ManagedUser[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { showToast } = useToast()

    // Modal state
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDanger?: boolean;
        isLoading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    })

    // Handle pagination
    useEffect(() => {
        fetchAdmins(currentPage)
    }, [currentPage])

    const fetchAdmins = async (page: number) => {
        setLoading(true)
        try {
            const res = await superadminApi.listAdmins(page)
            // res = { data: { data: [], totalPages, ... } }
            const paginatedData = (res as any).data
            setAdmins(paginatedData.data)
            setTotalPages(paginatedData.totalPages || 1)
            setCurrentPage(paginatedData.page || 1)
        } catch {
            showToast('Failed to load admins', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateRole = (userId: string, role: 'user' | 'admin' | 'superadmin') => {
        setConfirmConfig({
            isOpen: true,
            title: 'Demote Administrator',
            message: `Are you sure you want to demote this user to ${role}? They will lose administrative access.`,
            isDanger: true,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isLoading: true }))
                try {
                    await superadminApi.updateUserRole(userId, role)
                    showToast(`User role updated to ${role}`)
                    fetchAdmins(currentPage)
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }))
                } catch (err: any) {
                    const msg = err.response?.data?.error || 'Failed to update role'
                    showToast(msg, 'error')
                    setConfirmConfig(prev => ({ ...prev, isLoading: false }))
                }
            }
        })
    }

    const handleDeleteUser = (userId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            isDanger: true,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isLoading: true }))
                try {
                    await superadminApi.deleteUser(userId)
                    showToast('User deleted successfully')
                    fetchAdmins(currentPage)
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }))
                } catch (err: any) {
                    const msg = err.response?.data?.error || 'Failed to delete user'
                    showToast(msg, 'error')
                    setConfirmConfig(prev => ({ ...prev, isLoading: false }))
                }
            }
        })
    }

    return (
        <div className="admin-page container">
            <header className="page-header">
                <div>
                    <h1>Admin Management</h1>
                    <p>Manage system administrators and roles</p>
                </div>
            </header>

            <div className="admin-table-container">
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <p className="text-sm text-text-muted">Showing all system administrators</p>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin._id}>
                                <td className="font-bold">{admin.username}</td>
                                <td>
                                    <span className={`badge badge-${admin.role}`}>
                                        {admin.role}
                                    </span>
                                </td>
                                <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    {admin.role === 'admin' && (
                                        <button
                                            className="btn btn-ghost btn-xs text-danger"
                                            onClick={() => handleUpdateRole(admin._id, 'user')}
                                        >
                                            Demote
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-ghost btn-xs text-danger"
                                        onClick={() => handleDeleteUser(admin._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="loading-overlay">Loading...</div>}

                {admins.length === 0 && !loading && (
                    <div className="p-8 text-center text-text-muted">
                        No admins found.
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
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                isDanger={confirmConfig.isDanger}
                isLoading={confirmConfig.isLoading}
            />
        </div>
    )
}
