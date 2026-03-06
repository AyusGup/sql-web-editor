import { useState, useMemo } from 'react'
import type { ExpectedOutput, SampleTable, Column } from '../../types/assignment'
import TableEditor from './TableEditor'
import './ExpectedOutputEditor.scss'

interface ExpectedOutputEditorProps {
    value: ExpectedOutput
    onChange: (value: ExpectedOutput) => void
}

const OUTPUT_TYPES = ['table', 'single_value', 'column', 'count'] as const

export default function ExpectedOutputEditor({ value, onChange }: ExpectedOutputEditorProps) {
    const [jsonMode, setJsonMode] = useState(false)
    const [jsonText, setJsonText] = useState(JSON.stringify(value.value, null, 2))
    const [jsonError, setJsonError] = useState<string | null>(null)

    // Ensure we have a valid SampleTable structure for the table type
    const tableData = useMemo(() => {
        if (value.type !== 'table') return null

        const val = value.value
        if (val && typeof val === 'object' && 'rows' in (val as any) && 'columns' in (val as any)) {
            return val as SampleTable
        }

        // Legacy or format conversion: derive from array
        const rows = Array.isArray(val) ? (val as Record<string, unknown>[]) : []
        const allKeys = new Set<string>()
        rows.forEach(row => {
            if (row && typeof row === 'object') {
                Object.keys(row).forEach(k => allKeys.add(k))
            }
        })
        const columns = Array.from(allKeys).map(name => ({ columnName: name, dataType: 'VARCHAR' }))
        return { tableName: 'Result', columns, rows }
    }, [value.type, value.value])

    const handleTypeChange = (type: ExpectedOutput['type']) => {
        let newValue: unknown = value.value
        if (type === 'table') {
            newValue = tableData || { tableName: 'Result', columns: [], rows: [] }
        } else if (type === 'count') {
            newValue = typeof value.value === 'number' ? value.value : 0
        } else if (type === 'single_value') {
            newValue = typeof value.value === 'string' ? value.value : ''
        } else if (type === 'column') {
            newValue = Array.isArray(value.value) ? value.value : []
        }

        const updated = { type, value: newValue }
        onChange(updated)
        setJsonText(JSON.stringify(newValue, null, 2))
    }

    const handleJsonChange = (text: string) => {
        setJsonText(text)
        setJsonError(null)
        try {
            const parsed = JSON.parse(text)
            onChange({ ...value, value: parsed })
        } catch (err: any) {
            setJsonError(err.message)
        }
    }

    const handleTableChange = (_columns: Column[], rows: Record<string, unknown>[]) => {
        onChange({
            ...value,
            value: rows
        })
    }

    // Single value / count editor
    const renderSingleInput = () => (
        <input
            type={value.type === 'count' ? 'number' : 'text'}
            className="expected-single-input"
            value={value.value === null || value.value === undefined ? '' : String(value.value)}
            onChange={e => {
                const val = value.type === 'count' ? Number(e.target.value) : e.target.value
                onChange({ ...value, value: val })
            }}
            placeholder={value.type === 'count' ? 'Expected count...' : 'Expected value...'}
        />
    )

    // Column values editor
    const renderColumnEditor = () => {
        const items = Array.isArray(value.value) ? (value.value as unknown[]) : []

        const addItem = () => onChange({ ...value, value: [...items, ''] })
        const updateItem = (idx: number, val: string) => {
            onChange({ ...value, value: items.map((it, i) => i === idx ? val : it) })
        }
        const removeItem = (idx: number) => {
            onChange({ ...value, value: items.filter((_, i) => i !== idx) })
        }

        return (
            <div className="expected-column-editor">
                {items.map((item, idx) => (
                    <div key={idx} className="expected-column-editor__item">
                        <input
                            type="text"
                            value={String(item)}
                            onChange={e => updateItem(idx, e.target.value)}
                            placeholder={`Value ${idx + 1}`}
                        />
                        <button type="button" className="btn-remove-item" onClick={() => removeItem(idx)}>✕</button>
                    </div>
                ))}
                <button type="button" className="btn-add-row" onClick={addItem}>+ Add Value</button>
            </div>
        )
    }

    return (
        <div className="expected-output-editor">
            <div className="expected-output-editor__header">
                <label>Expected Output</label>
                <div className="expected-output-editor__controls">
                    <select
                        value={value.type}
                        onChange={e => handleTypeChange(e.target.value as ExpectedOutput['type'])}
                        className="expected-output-editor__type-select"
                    >
                        {OUTPUT_TYPES.map(t => (
                            <option key={t} value={t}>
                                {t === 'single_value' ? 'Single Value' : t === 'table' ? 'Table' : t === 'column' ? 'Column' : 'Count'}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={`btn btn-ghost btn-xs${jsonMode ? ' active' : ''}`}
                        onClick={() => {
                            if (!jsonMode) setJsonText(JSON.stringify(value.value, null, 2))
                            setJsonMode(!jsonMode)
                        }}
                    >
                        {jsonMode ? 'Visual' : 'JSON'}
                    </button>
                </div>
            </div>

            {jsonMode ? (
                <div className="expected-output-editor__json">
                    <textarea
                        value={jsonText}
                        onChange={e => handleJsonChange(e.target.value)}
                        rows={8}
                        className="font-mono text-xs"
                    />
                    {jsonError && <span className="expected-output-editor__error">{jsonError}</span>}
                </div>
            ) : (
                <div className="expected-output-editor__visual">
                    {value.type === 'table' && tableData && (
                        <TableEditor
                            columns={tableData.columns}
                            rows={tableData.rows}
                            onChange={handleTableChange}
                            hideName
                            hideType
                        />
                    )}
                    {(value.type === 'single_value' || value.type === 'count') && renderSingleInput()}
                    {value.type === 'column' && renderColumnEditor()}
                </div>
            )}
        </div>
    )
}
