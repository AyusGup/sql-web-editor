import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import ReactDOM from 'react-dom'
import './Toast.scss'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } })

export function useToast() {
    return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = nextId++
        setToasts(prev => [...prev, { id, message, type }])
    }, [])

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {ReactDOM.createPortal(
                <div className="toast-container">
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 3000)
        return () => clearTimeout(timer)
    }, [toast.id, onRemove])

    const icon = toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'

    return (
        <div className={`toast toast-${toast.type}`} onClick={() => onRemove(toast.id)}>
            <span className="toast-icon">{icon}</span>
            <span className="toast-message">{toast.message}</span>
        </div>
    )
}
