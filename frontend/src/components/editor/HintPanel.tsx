import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAppDispatch } from '../../hooks/useRedux'
import { useAppSelector } from '../../hooks/useRedux'
import { getHintThunk, clearHint } from '../../features/editor/editorSlice'
import './HintPanel.scss'

interface Props { assignmentId: string }

export default function HintPanel({ assignmentId }: Props) {
    const dispatch = useAppDispatch()
    const { hint, hintLoading, hintError, query } = useAppSelector((s) => s.editor)
    const [open, setOpen] = useState(false)

    const handleGetHint = () => {
        setOpen(true)
        dispatch(getHintThunk({
            problemId: assignmentId,
            userQuery: query,
        }))
    }

    return (
        <div className="hint-panel">
            <div className="hint-bar">
                <span className="hint-label">Need a hint?</span>
                <div className="hint-actions">
                    {hint && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { dispatch(clearHint()); setOpen(false) }}>
                            Clear
                        </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={handleGetHint} disabled={hintLoading}>
                        {hintLoading ? 'Thinking...' : 'Get Hint'}
                    </button>
                </div>
            </div>

            {open && (
                <div className="hint-content">
                    {hintLoading && (
                        <div className="hint-loading">
                            <div className="spinner" />
                            <p>Generating hint...</p>
                        </div>
                    )}
                    {hintError && <p className="hint-error">{hintError}</p>}
                    {hint && !hintLoading && (
                        <div className="hint-body">
                            <ReactMarkdown>{hint}</ReactMarkdown>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
