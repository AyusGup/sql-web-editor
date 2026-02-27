import { useState } from 'react'
import type { SampleTable } from '../../types/assignment'
import './SampleDataViewer.scss'

interface Props { tables: SampleTable[] }

export default function SampleDataViewer({ tables }: Props) {
    const [activeTable, setActiveTable] = useState(0)
    const [activeTab, setActiveTab] = useState<'schema' | 'data'>('schema')

    if (!tables.length) return null
    const table = tables[activeTable]

    return (
        <section className="sample-viewer">
            <div className="sample-viewer-header">
                <div className="sample-viewer-tables">
                    {tables.map((t, i) => (
                        <button
                            key={t.tableName}
                            className={`sample-table-btn${i === activeTable ? ' is-active' : ''}`}
                            onClick={() => setActiveTable(i)}
                        >
                            {t.tableName}
                        </button>
                    ))}
                </div>
                <div className="sample-viewer-tabs">
                    {(['schema', 'data'] as const).map((tab) => (
                        <button
                            key={tab}
                            className={`sample-tab${activeTab === tab ? ' is-active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="sample-viewer-content">
                {activeTab === 'schema' ? (
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
                ) : (
                    <div className="sample-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>{table.columns.map((c) => <th key={c.columnName}>{c.columnName}</th>)}</tr>
                            </thead>
                            <tbody>
                                {table.rows.slice(0, 10).map((row, i) => (
                                    <tr key={i}>
                                        {table.columns.map((c) => (
                                            <td key={c.columnName}>{String(row[c.columnName] ?? '')}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    )
}
