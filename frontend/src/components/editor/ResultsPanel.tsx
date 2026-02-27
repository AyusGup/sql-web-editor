import { useState } from 'react'
import { useAppSelector } from '../../hooks/useRedux'
import type { ExpectedOutput } from '../../types/assignment'
import './ResultsPanel.scss'

interface Props {
    expectedOutput?: ExpectedOutput
}

export default function ResultsPanel({ expectedOutput }: Props) {
    const { result, executing, executeError } = useAppSelector((s) => s.editor)
    const [activeTab, setActiveTab] = useState<'result' | 'expected'>('result')

    return (
        <div className="results-panel">
            <div className="results-header">
                <button
                    className={`results-tab${activeTab === 'result' ? ' is-active' : ''}`}
                    onClick={() => setActiveTab('result')}
                >
                    Execution Result
                </button>
                {expectedOutput && (
                    <button
                        className={`results-tab${activeTab === 'expected' ? ' is-active' : ''}`}
                        onClick={() => setActiveTab('expected')}
                    >
                        Expected Output
                    </button>
                )}
            </div>

            {activeTab === 'result' ? (
                executing ? (
                    <div className="results-content is-center">
                        <div className="spinner" />
                        <p>Running query...</p>
                    </div>
                ) : executeError ? (
                    <div className="results-content is-center">
                        <div className="results-error">
                            <span>!</span>
                            <p>{executeError}</p>
                        </div>
                    </div>
                ) : !result ? (
                    <div className="results-content is-center is-empty">
                        <span>&#9654;</span>
                        <p>Run your query to see results here</p>
                    </div>
                ) : (
                    <div className="results-content">
                        <div className={`results-grading${result.grading.correct ? ' is-correct' : ' is-wrong'}`}>
                            <span>{result.grading.correct ? 'OK' : 'X'}</span>
                            <p>{result.grading.message}</p>
                        </div>
                        {result.rows.length > 0 && (
                            <div className="results-table-wrap">
                                <p className="results-count">{result.rows.length} row{result.rows.length !== 1 ? 's' : ''}</p>
                                <table className="data-table">
                                    <thead>
                                        <tr>{Object.keys(result.rows[0]).map((c) => <th key={c}>{c}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {result.rows.map((row, i) => (
                                            <tr key={i}>
                                                {Object.keys(result.rows[0]).map((c) => <td key={c}>{String(row[c] ?? '')}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {result.rows.length === 0 && (
                            <p className="results-no-rows">Query returned 0 rows.</p>
                        )}
                    </div>
                )
            ) : (
                <div className="results-content">
                    {expectedOutput && (
                        <div className="results-table-wrap">
                            {Array.isArray(expectedOutput.value) && expectedOutput.value.length > 0 && typeof expectedOutput.value[0] === 'object' ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            {Object.keys(expectedOutput.value[0] as object).map(k => <th key={k}>{k}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(expectedOutput.value as any[]).map((row, i) => (
                                            <tr key={i}>
                                                {Object.values(row).map((v, j) => <td key={j}>{String(v ?? '')}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <pre style={{ margin: '16px', padding: 0 }}>
                                    {JSON.stringify(expectedOutput.value, null, 2)}
                                </pre>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
