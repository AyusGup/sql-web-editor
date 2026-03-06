import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { fetchAssignmentsAdmin, createAssignmentThunk, updateAssignmentThunk, deleteAssignmentThunk } from '../../features/admin/adminSlice'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import { useToast } from '../../components/common/Toast'
import AssignmentForm from '../../components/admin/AssignmentForm'
import type { Assignment, CreateAssignmentDTO } from '../../types/assignment'
import './AdminAssignments.scss'

export default function AdminAssignmentsPage() {
    const dispatch = useAppDispatch()
    const { assignments, loading, assignmentsPage, assignmentsTotalPages } = useAppSelector((s) => s.admin)
    const { showToast } = useToast()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        dispatch(fetchAssignmentsAdmin(currentPage))
    }, [dispatch, currentPage])

    const handleCreate = () => {
        setEditingAssignment(null)
        setIsModalOpen(true)
    }

    const handleEdit = (assignment: Assignment) => {
        setEditingAssignment(assignment)
        setIsModalOpen(true)
    }

    const handleDelete = (id: string) => {
        setAssignmentToDelete(id)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!assignmentToDelete) return
        setIsSubmitting(true)
        try {
            await dispatch(deleteAssignmentThunk(assignmentToDelete)).unwrap()
            showToast('Assignment deleted successfully')
            dispatch(fetchAssignmentsAdmin(currentPage)) // Refresh current page
            setIsDeleteModalOpen(false)
        } catch {
            showToast('Failed to delete assignment', 'error')
        } finally {
            setIsSubmitting(false)
            setAssignmentToDelete(null)
        }
    }

    const handleSubmit = async (data: CreateAssignmentDTO) => {
        setIsSubmitting(true)
        try {
            if (editingAssignment) {
                // Include version for OCC – backend returns 409 if stale
                const updatePayload = { ...data, version: editingAssignment.version }
                await dispatch(updateAssignmentThunk({ id: editingAssignment._id, data: updatePayload })).unwrap()
                showToast('Assignment updated successfully')
            } else {
                await dispatch(createAssignmentThunk(data)).unwrap()
                showToast('Assignment created successfully')
            }
            dispatch(fetchAssignmentsAdmin(currentPage)) // Refresh current page
            setIsModalOpen(false)
        } catch (err: any) {
            const isConflict = err?.status === 409 || String(err).includes('409')
            if (isConflict) {
                showToast('This assignment was modified by another admin. Please close and reopen to get the latest version before editing.', 'error')
            } else {
                showToast('Failed to save assignment', 'error')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="admin-page container">
            <header className="page-header">
                <div>
                    <h1>Manage Assignments</h1>
                    <p>Create and update SQL challenges</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + New Assignment
                </button>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th>Tags</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map((a) => (
                            <tr key={a._id}>
                                <td className="font-bold">{a.title}</td>
                                <td>
                                    <span className={`badge badge-${a.difficulty.toLowerCase()}`}>
                                        {a.difficulty}
                                    </span>
                                </td>
                                <td>
                                    {a.tags.map(tag => (
                                        <span key={tag} className="badge badge-tag">{tag}</span>
                                    ))}
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => handleEdit(a)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-xs text-danger"
                                        onClick={() => handleDelete(a._id)}
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
                currentPage={assignmentsPage}
                totalPages={assignmentsTotalPages}
                onPageChange={setCurrentPage}
                loading={loading}
            />
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAssignment ? 'Edit Assignment' : 'New Assignment'}
            >
                <AssignmentForm
                    initialData={editingAssignment}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            </Modal>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Assignment"
                message="Are you sure you want to delete this assignment? This action cannot be undone."
                confirmText="Delete"
                isDanger
                isLoading={isSubmitting}
            />
        </div>
    )
}
