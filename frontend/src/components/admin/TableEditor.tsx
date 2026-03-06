import { useState, useCallback } from 'react'
import type { Column } from '../../types/assignment'
import './TableEditor.scss'

export const DATA_TYPES = [
    'INT', 'BIGINT', 'VARCHAR', 'TEXT', 'BOOLEAN',
    'DATE', 'TIMESTAMP', 'NUMERIC', 'FLOAT'
] as const

interface TableEditorProps {
    tableName?: string
    columns: Column[]
    rows: Record<string, unknown>[]
    onChange: (columns: Column[], rows: Record<string, unknown>[]) => void
    onNameChange?: (name: string) => void
    onRemove?: () => void
    hideName?: boolean
    hideType?: boolean
}

function validateCell(value: unknown, dataType: string): string | null {
    if (!dataType || dataType === 'VARCHAR') return null; // Skip validation for VARCHAR or when hidden
    if (value === null || value === undefined || value === '') return null

    const str = String(value).trim()
    const upper = dataType.toUpperCase()

    if (upper === 'INT' || upper === 'BIGINT') {
        if (!/^-?\d+$/.test(str)) return 'Must be an integer'
    } else if (upper === 'FLOAT' || upper === 'NUMERIC' || upper === 'DECIMAL' || upper === 'REAL') {
        // Support .5, 5., 1e10, +5, etc
        if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(str)) return 'Must be a number'
    } else if (upper === 'BOOLEAN') {
        if (!['true', 'false', '1', '0'].includes(str.toLowerCase())) return 'Must be true/false'
    } else if (upper === 'DATE') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return 'Format: YYYY-MM-DD'
    } else if (upper === 'TIMESTAMP') {
        if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(str)) return 'Format: YYYY-MM-DD HH:MM'
    }

    return null
}

// No casting during input to preserve formatting while typing

export default function TableEditor({
    tableName,
    columns,
    rows,
    onChange,
    onNameChange,
    onRemove,
    hideName = false,
    hideType = false
}: TableEditorProps) {
    const [errors, setErrors] = useState<Map<string, string>>(new Map())

    const addColumn = () => {
        const newCol: Column = { columnName: `col_${columns.length + 1}`, dataType: 'VARCHAR' }
        const newRows = rows.map(row => ({ ...row, [newCol.columnName]: '' }))
        onChange([...columns, newCol], newRows)
    }

    const removeColumn = (colIdx: number) => {
        const colName = columns[colIdx].columnName
        const newCols = columns.filter((_, i) => i !== colIdx)
        const newRows = rows.map(row => {
            const { [colName]: _, ...rest } = row as Record<string, unknown>
            return rest
        })
        onChange(newCols, newRows)
    }

    const updateColumnName = (colIdx: number, newName: string) => {
        const oldName = columns[colIdx].columnName
        const newCols = columns.map((c, i) =>
            i === colIdx ? { ...c, columnName: newName } : c
        )
        const newRows = rows.map(row => {
            const entries = Object.entries(row as Record<string, unknown>)
            return Object.fromEntries(
                entries.map(([key, val]) => key === oldName ? [newName, val] : [key, val])
            )
        })
        onChange(newCols, newRows)
    }

    const updateColumnType = (colIdx: number, newType: string) => {
        const newCols = columns.map((c, i) =>
            i === colIdx ? { ...c, dataType: newType } : c
        )
        // Re-validate all cells in this column
        const colName = columns[colIdx].columnName
        const newErrors = new Map(errors)
        rows.forEach((row, rowIdx) => {
            const key = `${rowIdx}-${colIdx}`
            const err = validateCell((row as Record<string, unknown>)[colName], newType)
            if (err) newErrors.set(key, err)
            else newErrors.delete(key)
        })
        setErrors(newErrors)
        onChange(newCols, rows)
    }

    const addRow = () => {
        const emptyRow: Record<string, unknown> = {}
        columns.forEach(col => { emptyRow[col.columnName] = '' })
        onChange(columns, [...rows, emptyRow])
    }

    const removeRow = (rowIdx: number) => {
        onChange(columns, rows.filter((_, i) => i !== rowIdx))
    }

    const updateCell = useCallback((rowIdx: number, colIdx: number, value: string) => {
        const col = columns[colIdx]
        const key = `${rowIdx}-${colIdx}`
        const err = validateCell(value, col.dataType)

        setErrors(prev => {
            const next = new Map(prev)
            if (err) next.set(key, err)
            else next.delete(key)
            return next
        })

        // We store the raw string to preserve formatting (dots, trailing zeros)
        // while typing. Grader/Normalization handles comparison later.
        const newRows = rows.map((row, i) => {
            if (i !== rowIdx) return row
            return { ...(row as Record<string, unknown>), [col.columnName]: value }
        })
        onChange(columns, newRows)
    }, [columns, rows, onChange])

    return (
        <div className="table-editor">
            {!hideName && (
                <div className="table-editor__header">
                    <input
                        type="text"
                        className="table-editor__name"
                        value={tableName || ''}
                        onChange={e => onNameChange?.(e.target.value)}
                        placeholder="Table name..."
                    />
                    {onRemove && (
                        <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={onRemove}
                            title="Remove table"
                        >
                            ✕ Remove Table
                        </button>
                    )}
                </div>
            )}

            <div className="table-editor__grid-wrapper">
                <table className="table-editor__grid">
                    <thead>
                        <tr>
                            <th className="table-editor__row-num">#</th>
                            {columns.map((col, colIdx) => (
                                <th key={colIdx} className="table-editor__col-header">
                                    <input
                                        type="text"
                                        className="table-editor__col-name"
                                        value={col.columnName}
                                        onChange={e => updateColumnName(colIdx, e.target.value)}
                                        placeholder="column"
                                    />
                                    {!hideType && (
                                        <select
                                            className="table-editor__col-type"
                                            value={col.dataType.toUpperCase()}
                                            onChange={e => updateColumnType(colIdx, e.target.value)}
                                        >
                                            {DATA_TYPES.map(dt => (
                                                <option key={dt} value={dt}>{dt}</option>
                                            ))}
                                        </select>
                                    )}
                                    <button
                                        type="button"
                                        className="table-editor__col-remove"
                                        onClick={() => removeColumn(colIdx)}
                                        title="Remove column"
                                    >
                                        ✕
                                    </button>
                                </th>
                            ))}
                            <th className="table-editor__add-col">
                                <button type="button" className="btn-add" onClick={addColumn} title="Add column">
                                    +
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="table-editor__row-num">
                                    <span>{rowIdx + 1}</span>
                                    <button
                                        type="button"
                                        className="table-editor__row-remove"
                                        onClick={() => removeRow(rowIdx)}
                                        title="Remove row"
                                    >
                                        ✕
                                    </button>
                                </td>
                                {columns.map((col, colIdx) => {
                                    const key = `${rowIdx}-${colIdx}`
                                    const cellValue = (row as Record<string, unknown>)[col.columnName]
                                    const error = errors.get(key)
                                    return (
                                        <td key={colIdx} className={`table-editor__cell${error ? ' cell-error' : ''}`}>
                                            <input
                                                type="text"
                                                value={cellValue === null || cellValue === undefined ? '' : String(cellValue)}
                                                onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                                                placeholder={col.dataType}
                                            />
                                            {error && <span className="cell-error-msg">{error}</span>}
                                        </td>
                                    )
                                })}
                                <td style={{ border: 'none' }}></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button type="button" className="btn-add-row" onClick={addRow}>
                + Add Row
            </button>
        </div>
    )
}
