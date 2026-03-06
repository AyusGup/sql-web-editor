import { useState } from 'react'
import type { Assignment, CreateAssignmentDTO } from '../../types/assignment'
import './AssignmentForm.scss'

interface AssignmentFormProps {
    initialData?: Assignment | null
    onSubmit: (data: CreateAssignmentDTO) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export default function AssignmentForm({ initialData, onSubmit, onCancel, isSubmitting }: AssignmentFormProps) {
    const [formData, setFormData] = useState<CreateAssignmentDTO>({
        title: initialData?.title || '',
        difficulty: initialData?.difficulty || 'Easy',
        question: initialData?.question || '',
        tags: initialData?.tags || [],
    })
    const [tagInput, setTagInput] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const addTag = () => {
        if (!tagInput.trim()) return
        if (formData.tags.includes(tagInput.trim())) return
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
        setTagInput('')
    }

    const removeTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
    }

    return (
        <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Basic SELECT query"
                />
            </div>

            <div className="form-group">
                <label>Difficulty</label>
                <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            <div className="form-group">
                <label>Question / Prompt</label>
                <textarea
                    required
                    value={formData.question}
                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Write the challenge description here..."
                    rows={5}
                />
            </div>

            <div className="form-group">
                <label>Tags</label>
                <div className="tag-input-wrapper">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag..."
                    />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>Add</button>
                </div>
                <div className="tag-list">
                    {formData.tags.map(tag => (
                        <span key={tag} className="badge badge-tag">
                            {tag} <button type="button" onClick={() => removeTag(tag)}>&times;</button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex-end gap-3 mt-8">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    )
}
