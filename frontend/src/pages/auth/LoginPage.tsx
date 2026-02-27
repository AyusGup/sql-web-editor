import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useRedux'
import { useAuth } from '../../hooks/useAuth'
import { loginThunk, clearError } from '../../features/auth/authSlice'
import { ROUTES } from '../../constants/routes'
import './AuthPage.scss'

export default function LoginPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { loading, error, isAuthenticated } = useAuth()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (isAuthenticated) navigate(ROUTES.ASSIGNMENTS, { replace: true })
        return () => { dispatch(clearError()) }
    }, [isAuthenticated, navigate, dispatch])

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        dispatch(loginThunk({ username, password }))
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">S</div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to continue to SQL Editor</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            className="form-input"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="form-input"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don&apos;t have an account?{' '}
                    <Link to={ROUTES.REGISTER}>Create one</Link>
                </div>
            </div>
        </div>
    )
}
