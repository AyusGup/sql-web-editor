import { useAppSelector } from '../../hooks/useRedux'
import './ResultsPanel.scss'

export default function ResultsPanel() {
    const { result, executing, executeError } = useAppSelector((s) => s.editor)

    return (
        <div className="results-panel">
            <div className="results-header">
                <span className="results-header-title">Execution Result</span>
            </div>

            {executing ? (
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

                    {result.results.map((res, tcIdx) => (
                        <div key={res.testcaseId} className="result-item">
                            {result.type === 'run' && (
                                <div className={`result-item-header is-${res.grading.correct ? 'correct' : 'wrong'}`}>
                                    Test Case {tcIdx + 1}: {res.grading.correct ? 'Passed' : 'Failed'}
                                </div>
                            )}

                            {res.rows.length > 0 ? (
                                <div className="results-table-wrap">
                                    <p className="results-count">
                                        {res.rows.length} row{res.rows.length !== 1 ? 's' : ''}
                                    </p>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                {Object.keys(res.rows[0]).map((c) => (
                                                    <th key={c}>{c}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {res.rows.map((row, i) => (
                                                <tr key={i}>
                                                    {Object.keys(res.rows[0]).map((c) => (
                                                        <td key={c}>{String(row[c] ?? '')}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="results-no-rows">Query returned 0 rows.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
