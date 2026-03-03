import type { Testcase } from '../../types/assignment'
import './SampleDataViewer.scss'

interface Props { testcases: Testcase[] }

export default function SampleDataViewer({ testcases }: Props) {
    if (!testcases.length) return null

    const firstTc = testcases[0]

    return (
        <section className="sample-viewer">
            <div className="sample-viewer-content">
                {/* ── Section 1: Schema ── */}
                <div className="sticky-sub-header">Database Schema</div>
                <div className="schema-section">
                    {firstTc.sampleTables.map((table) => (
                        <div key={table.tableName} className="schema-table-block">
                            <div className="schema-table-name">{table.tableName}</div>
                            <table className="data-table">
                                <thead>
                                    <tr><th>Column</th><th>Type</th></tr>
                                </thead>
                                <tbody>
                                    {table.columns.map((col) => (
                                        <tr key={col.columnName}>
                                            <td><code>{col.columnName}</code></td>
                                            <td><span className="badge badge-tag">{col.dataType}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* ── Section 2: Data ── */}
                <div className="sticky-sub-header is-data">Test Cases & Data Samples</div>
                <div className="data-section">
                    {testcases.map((tc, tcIndex) => (
                        <div key={tc._id} className="testcase-block">
                            <div className="testcase-heading">
                                <span className="testcase-number">Test Case {tcIndex + 1}</span>
                                {!tc.visible && <span className="badge badge-error badge-sm">Hidden</span>}
                            </div>

                            {tc.sampleTables.map((table) => (
                                <div key={table.tableName} className="testcase-table-section">
                                    <div className="testcase-table-label">{table.tableName}</div>
                                    <div className="sample-table-wrap">
                                        <table className="data-table">
                                            <thead>
                                                <tr>{table.columns.map((c) => <th key={c.columnName}>{c.columnName}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                {table.rows.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        {table.columns.map((c) => (
                                                            <td key={c.columnName}>{String(row[c.columnName] ?? '')}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                            <div className="testcase-table-section">
                                <div className="testcase-table-label testcase-expected-label">Expected Output</div>
                                <div className="sample-table-wrap">
                                    {Array.isArray(tc.expectedOutput.value) && tc.expectedOutput.value.length > 0 && typeof tc.expectedOutput.value[0] === 'object' ? (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    {Object.keys(tc.expectedOutput.value[0] as object).map(k => <th key={k}>{k}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(tc.expectedOutput.value as Record<string, unknown>[]).map((row, i) => (
                                                    <tr key={i}>
                                                        {Object.values(row).map((v, j) => <td key={j}>{String(v ?? '')}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <pre className="testcase-expected-pre">
                                            {JSON.stringify(tc.expectedOutput.value, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
