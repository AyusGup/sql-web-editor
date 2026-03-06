import { useState } from 'react'
import type { Testcase, CreateTestcaseDTO, SampleTable, ExpectedOutput, LinkedAssignment } from '../../types/assignment'
import SampleTablesEditor from './SampleTablesEditor'
import ExpectedOutputEditor from './ExpectedOutputEditor'
import LinkedAssignmentsEditor from './LinkedAssignmentsEditor'
import './TestcaseForm.scss'

interface TestcaseFormProps {
    initialData?: Testcase | null
    onSubmit: (data: CreateTestcaseDTO, linkedAssignments: LinkedAssignment[]) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export default function TestcaseForm({ initialData, onSubmit, onCancel, isSubmitting }: TestcaseFormProps) {
    const [visible, setVisible] = useState(initialData?.visible ?? true)
    const [sampleTables, setSampleTables] = useState<SampleTable[]>(
        initialData?.sampleTables || []
    )
    const [expectedOutput, setExpectedOutput] = useState<ExpectedOutput>(
        initialData?.expectedOutput || { type: 'table', value: [] }
    )
    const [linkedAssignments, setLinkedAssignments] = useState<LinkedAssignment[]>(
        initialData?.linkedAssignments || []
    )
    const [error, setError] = useState<string | null>(null)

    const cleanupData = () => {
        const castValue = (val: any, type: string) => {
            if (val === null || val === undefined || val === '') return null;
            const upper = type.toUpperCase();
            if (upper === 'INT' || upper === 'BIGINT') {
                const p = parseInt(String(val), 10);
                return isNaN(p) ? val : p;
            }
            if (upper === 'FLOAT' || upper === 'NUMERIC' || upper === 'DECIMAL' || upper === 'REAL') {
                const p = parseFloat(String(val));
                return isNaN(p) ? val : p;
            }
            if (upper === 'BOOLEAN') {
                const str = String(val).toLowerCase();
                if (str === 'true' || str === '1') return true;
                if (str === 'false' || str === '0') return false;
                return val;
            }
            return val;
        };

        const cleanedTables = sampleTables.map(table => ({
            ...table,
            rows: table.rows.map(row => {
                const newRow: any = {};
                table.columns.forEach(col => {
                    newRow[col.columnName] = castValue(row[col.columnName], col.dataType);
                });
                return newRow;
            })
        }));

        let cleanedExpected = { ...expectedOutput };
        if (expectedOutput.type === 'count') {
            cleanedExpected.value = Number(expectedOutput.value);
        }

        return { cleanedTables, cleanedExpected };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // ... existing validation ...
        if (sampleTables.length === 0) {
            setError('At least one sample table is required.')
            return
        }

        const names = sampleTables.map(t => t.tableName.trim().toLowerCase())
        if (names.some(n => !n)) {
            setError('All tables must have a name.')
            return
        }
        if (new Set(names).size !== names.length) {
            setError('Table names must be unique.')
            return
        }

        for (const table of sampleTables) {
            if (table.columns.length === 0) {
                setError(`Table "${table.tableName}" must have at least one column.`)
                return
            }
        }

        const { cleanedTables, cleanedExpected } = cleanupData();
        onSubmit({ visible, sampleTables: cleanedTables, expectedOutput: cleanedExpected }, linkedAssignments)
    }

    return (
        <form className="admin-form testcase-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group checkbox-group">
                <input
                    id="visible-check"
                    type="checkbox"
                    checked={visible}
                    onChange={e => setVisible(e.target.checked)}
                />
                <label htmlFor="visible-check">Visible to User (Sample data)</label>
            </div>

            <SampleTablesEditor tables={sampleTables} onChange={setSampleTables} />

            <ExpectedOutputEditor value={expectedOutput} onChange={setExpectedOutput} />

            <LinkedAssignmentsEditor
                linkedAssignments={linkedAssignments}
                onChange={setLinkedAssignments}
            />

            <div className="flex-end gap-3 mt-8">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    )
}
