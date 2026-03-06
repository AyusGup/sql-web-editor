import TableEditor from './TableEditor'
import type { SampleTable } from '../../types/assignment'
import './SampleTablesEditor.scss'

interface SampleTablesEditorProps {
    tables: SampleTable[]
    onChange: (tables: SampleTable[]) => void
}

export default function SampleTablesEditor({ tables, onChange }: SampleTablesEditorProps) {
    const addTable = () => {
        onChange([
            ...tables,
            {
                tableName: `table_${tables.length + 1}`,
                columns: [{ columnName: 'id', dataType: 'INT' }],
                rows: [],
            },
        ])
    }

    const updateTable = (idx: number, updated: Partial<SampleTable>) => {
        onChange(tables.map((t, i) => (i === idx ? { ...t, ...updated } : t)))
    }

    const removeTable = (idx: number) => {
        onChange(tables.filter((_, i) => i !== idx))
    }

    return (
        <div className="sample-tables-editor">
            <div className="sample-tables-editor__label">
                <span>Sample Tables</span>
                <span className="sample-tables-editor__count">{tables.length} table{tables.length !== 1 ? 's' : ''}</span>
            </div>

            {tables.map((table, idx) => (
                <TableEditor
                    key={idx}
                    tableName={table.tableName}
                    columns={table.columns}
                    rows={table.rows}
                    onChange={(columns, rows) => updateTable(idx, { columns, rows })}
                    onNameChange={(name) => updateTable(idx, { tableName: name })}
                    onRemove={() => removeTable(idx)}
                />
            ))}

            <button type="button" className="btn-add-table" onClick={addTable}>
                + Add Table
            </button>
        </div>
    )
}
