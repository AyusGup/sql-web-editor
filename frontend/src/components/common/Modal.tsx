import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './Modal.scss'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
    fullscreen?: boolean
}

export default function Modal({ isOpen, onClose, title, children, footer, fullscreen }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', handleEscape)
        }
        return () => {
            document.body.style.overflow = 'unset'
            window.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content${fullscreen ? ' modal-fullscreen' : ''}`} onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{title}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </header>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <footer className="modal-footer">
                        {footer}
                    </footer>
                )}
            </div>
        </div>,
        document.body
    )
}
