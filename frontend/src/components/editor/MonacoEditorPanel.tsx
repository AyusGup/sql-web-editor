import { useRef, useEffect, useState } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import { useAppDispatch } from '../../hooks/useRedux'
import { useAppSelector } from '../../hooks/useRedux'
import { setQuery, executeQueryThunk } from '../../features/editor/editorSlice'
import { useAutosave } from '../../hooks/useAutosave'
import { theme } from '../../theme/tokens'
import { QUERY } from '../../constants/query'
import { SAVE_STATUS } from '../../constants/ui'
import './MonacoEditorPanel.scss'

interface Props {
    assignmentId: string
    initialQuery?: string
}

const SAVE_LABELS: Record<string, string> = {
    [SAVE_STATUS.IDLE]: '',
    [SAVE_STATUS.SAVING]: 'Saving...',
    [SAVE_STATUS.SAVED]: 'Saved',
    [SAVE_STATUS.ERROR]: 'Save failed',
}

export default function MonacoEditorPanel({ assignmentId, initialQuery = '' }: Props) {
    const dispatch = useAppDispatch()
    const query = useAppSelector((s) => s.editor.query)
    const executing = useAppSelector((s) => s.editor.executing)
    const saveStatus = useAppSelector((s) => s.save.status)
    const lastSavedAt = useAppSelector((s) => s.save.lastSavedAt)

    const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [editorHeight, setEditorHeight] = useState(400)

    useAutosave(assignmentId, query)

    useEffect(() => {
        const el = wrapperRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const h = entries[0]?.contentRect.height
            if (h && h > 0) setEditorHeight(h)
        })
        ro.observe(el)
        setEditorHeight(el.clientHeight || 400)
        return () => ro.disconnect()
    }, [])

    const handleMount: OnMount = (editor) => {
        editorRef.current = editor
        if (initialQuery) {
            editor.setValue(initialQuery)
            dispatch(setQuery(initialQuery))
        }
    }

    const handleChange = (val: string | undefined) => {
        dispatch(setQuery(val ?? ''))
    }

    const handleRun = () => {
        const current = editorRef.current?.getValue() ?? query
        if (!current.trim() || current.length > QUERY.MAX_QUERY_LENGTH) return
        dispatch(executeQueryThunk({ assignmentId, query: current }))
    }

    const savedTime = lastSavedAt
        ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null

    return (
        <div className="monaco-panel">
            <div className='monaco-toolbar'>
                <span className="monaco-label">SQL Editor</span>
                <div className="monaco-actions">
                    <span className={`monaco-save-status is-${saveStatus}`}>
                        {SAVE_LABELS[saveStatus]}
                        {saveStatus === SAVE_STATUS.SAVED && savedTime && ` at ${savedTime}`}
                    </span>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleRun}
                        disabled={executing}
                    >
                        {executing ? 'Running...' : 'Run'}
                    </button>
                </div>
            </div>

            <div ref={wrapperRef} className="monaco-editor-wrap">
                <Editor
                    height={editorHeight}
                    language="sql"
                    defaultValue={initialQuery}
                    onChange={handleChange}
                    onMount={handleMount}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: theme.fonts.mono,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: 'line',
                    }}
                />
            </div>
        </div>
    )
}
