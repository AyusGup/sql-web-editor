import React from 'react'
import './ErrorBoundary.scss'

interface Props { children: React.ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, message: '' }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-inner">
                        <span className="error-icon">!</span>
                        <h2>Something went wrong</h2>
                        <p>{this.state.message}</p>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
                            Reload page
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
