import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { fetchTestcasesAdmin, createTestcaseThunk, updateTestcaseThunk, deleteTestcaseThunk } from '../../features/admin/adminSlice'
import { adminApi } from '../../services/adminApi'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import { useToast } from '../../components/common/Toast'
import TestcaseForm from '../../components/admin/TestcaseForm'
import type { Testcase, CreateTestcaseDTO, LinkedAssignment } from '../../types/assignment'
import './AdminTestcases.scss'

export default function AdminTestcasesPage() {
    const dispatch = useAppDispatch()
    const { testcases, loading, testcasesPage, testcasesTotalPages } = useAppSelector((s) => s.admin)
    const { showToast } = useToast()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTestcase, setEditingTestcase] = useState<Testcase | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [testcaseToDelete, setTestcaseToDelete] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        dispatch(fetchTestcasesAdmin(currentPage))
    }, [dispatch, currentPage])

    const handleCreate = () => {
        setEditingTestcase(null)
        setIsModalOpen(true)
    }

    const handleEdit = (testcase: Testcase) => {
        setEditingTestcase(testcase)
        setIsModalOpen(true)
    }

    const handleDelete = (id: string) => {
        setTestcaseToDelete(id)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!testcaseToDelete) return
        setIsSubmitting(true)
        try {
            await dispatch(deleteTestcaseThunk(testcaseToDelete)).unwrap()
            showToast('Testcase deleted successfully')
            // Refresh current page
            dispatch(fetchTestcasesAdmin(currentPage))
            setIsDeleteModalOpen(false)
        } catch {
            showToast('Failed to delete testcase', 'error')
        } finally {
            setIsSubmitting(false)
            setTestcaseToDelete(null)
        }
    }

    const handleSubmit = async (data: CreateTestcaseDTO, linkedAssignments: LinkedAssignment[]) => {
        setIsSubmitting(true)
        try {
            const assignmentIds = linkedAssignments.map(la => la._id)

            if (editingTestcase) {
                // Include version for OCC – backend returns 409 if stale
                const updatePayload = { ...data, version: editingTestcase.version }
                await Promise.all([
                    dispatch(updateTestcaseThunk({ id: editingTestcase._id, data: updatePayload })).unwrap(),
                    adminApi.syncLinks(editingTestcase._id, assignmentIds),
                ])
            } else {
                // Create first (need the ID), then sync links
                const created = await dispatch(createTestcaseThunk(data)).unwrap()
                if (assignmentIds.length > 0) {
                    await adminApi.syncLinks(created._id, assignmentIds)
                }
            }

            // Refresh current page
            dispatch(fetchTestcasesAdmin(currentPage))

            showToast(editingTestcase ? 'Testcase updated successfully' : 'Testcase created successfully')
            setIsModalOpen(false)
        } catch (err: any) {
            const isConflict = err?.status === 409 || String(err).includes('409')
            if (isConflict) {
                showToast('This testcase was modified by another admin. Please close and reopen to get the latest version before editing.', 'error')
            } else {
                showToast('Failed to save testcase', 'error')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="admin-page container">
            <header className="page-header">
                <div>
                    <h1>Testcase Library</h1>
                    <p>Manage reusable testcases for grading</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + New Testcase
                </button>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tables</th>
                            <th>Linked Assignments</th>
                            <th>Visibility</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testcases.map((t) => (
                            <tr key={t._id}>
                                <td className="text-xs font-mono">{t._id}</td>
                                <td>
                                    {t.sampleTables.map(st => (
                                        <span key={st.tableName} className="badge badge-tag">{st.tableName}</span>
                                    ))}
                                </td>
                                <td>
                                    {t.linkedAssignments.length > 0 ? (
                                        t.linkedAssignments.map(la => (
                                            <span key={la._id} className="badge badge-info">{la.title}</span>
                                        ))
                                    ) : (
                                        <span className="text-muted text-xs">None</span>
                                    )}
                                </td>
                                <td>
                                    {t.visible ?
                                        <span className="badge badge-success">Public</span> :
                                        <span className="badge badge-danger">Hidden</span>
                                    }
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => handleEdit(t)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-xs text-danger"
                                        onClick={() => handleDelete(t._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="loading-overlay">Loading...</div>}
            </div>

            <Pagination
                currentPage={testcasesPage}
                totalPages={testcasesTotalPages}
                onPageChange={setCurrentPage}
                loading={loading}
            />
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTestcase ? 'Edit Testcase' : 'New Testcase'}
                fullscreen
            >
                <TestcaseForm
                    initialData={editingTestcase}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            </Modal>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Testcase"
                message="Are you sure you want to delete this testcase? This will unlink it from all assignments."
                confirmText="Delete"
                isDanger
                isLoading={isSubmitting}
            />
        </div>
    )
}
