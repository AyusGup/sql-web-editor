import { useState, useEffect, useRef } from 'react'
import { adminApi } from '../../services/adminApi'
import { QUERY } from '../../constants/query'
import type { LinkedAssignment, SearchedAssignment } from '../../types/assignment'
import './LinkedAssignmentsEditor.scss'

interface LinkedAssignmentsEditorProps {
    linkedAssignments: LinkedAssignment[]
    onChange: (linked: LinkedAssignment[]) => void
}

/** Frontend re-ranking: boost results by match quality */
function scoreMatch(query: string, title: string): number {
    const q = query.toLowerCase()
    const t = title.toLowerCase()

    if (t === q) return 100
    if (t.startsWith(q)) return 80
    const qWords = q.split(/\s+/)
    const tWords = t.split(/\s+/)
    const allPrefixes = qWords.every(qw =>
        tWords.some(tw => tw.startsWith(qw))
    )
    if (allPrefixes) return 60
    if (t.includes(q)) return 40
    return 20
}

export default function LinkedAssignmentsEditor({ linkedAssignments, onChange }: LinkedAssignmentsEditorProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<(SearchedAssignment & { score: number })[]>([])
    const [searching, setSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // 300ms debounced search
    useEffect(() => {
        if (query.trim().length < QUERY.SEARCH_THRESHOLD) {
            setResults([])
            setShowDropdown(false)
            return
        }

        setSearching(true)
        const timer = setTimeout(async () => {
            try {
                const res = await adminApi.searchAssignments(query.trim())
                const raw: SearchedAssignment[] = res.data.data || []

                // Re-rank with frontend scoring
                const ranked = raw
                    .map(a => ({ ...a, score: scoreMatch(query.trim(), a.title) }))
                    .sort((a, b) => b.score - a.score)

                // Filter out already-linked assignments
                const linkedIds = new Set(linkedAssignments.map(la => la._id))
                setResults(ranked.filter(a => !linkedIds.has(a._id)))
                setShowDropdown(true)
            } catch {
                setResults([])
            } finally {
                setSearching(false)
            }
        }, QUERY.DEBOUNCE_DELAY.LINK)

        return () => clearTimeout(timer)
    }, [query, linkedAssignments])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleLink = (assignment: SearchedAssignment) => {
        onChange([...linkedAssignments, { _id: assignment._id, title: assignment.title }])
        setQuery('')
        setShowDropdown(false)
    }

    const handleUnlink = (assignmentId: string) => {
        onChange(linkedAssignments.filter(la => la._id !== assignmentId))
    }

    return (
        <div className="linked-assignments-editor">
            <label className="linked-assignments-editor__label">Linked Assignments</label>

            {/* Linked chips */}
            {linkedAssignments.length > 0 && (
                <div className="linked-assignments-editor__chips">
                    {linkedAssignments.map(la => (
                        <div key={la._id} className="linked-chip">
                            <span className="linked-chip__title">{la.title}</span>
                            <button
                                type="button"
                                className="linked-chip__remove"
                                onClick={() => handleUnlink(la._id)}
                                title="Unlink"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search box */}
            <div className="linked-assignments-editor__search" ref={wrapperRef}>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    placeholder="Search assignments to link..."
                    className="linked-assignments-editor__input"
                />
                {searching && <span className="linked-assignments-editor__spinner">⟳</span>}

                {showDropdown && results.length > 0 && (
                    <div className="linked-assignments-editor__dropdown">
                        {results.map(a => (
                            <div key={a._id} className="linked-assignments-editor__result">
                                <div className="linked-assignments-editor__result-info">
                                    <span className="linked-assignments-editor__result-title">{a.title}</span>
                                    <span className={`badge badge-${a.difficulty.toLowerCase()}`}>
                                        {a.difficulty}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-xs"
                                    onClick={() => handleLink(a)}
                                >
                                    Link
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {showDropdown && !searching && results.length === 0 && query.length >= QUERY.SEARCH_THRESHOLD && (
                    <div className="linked-assignments-editor__dropdown">
                        <div className="linked-assignments-editor__no-results">No assignments found</div>
                    </div>
                )}
            </div>
        </div>
    )
}
