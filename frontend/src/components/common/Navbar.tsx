import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useRedux'
import { useAuth } from '../../hooks/useAuth'
import { logoutThunk } from '../../features/auth/authSlice'
import { ROUTES } from '../../constants/routes'
import './Navbar.scss'

export default function Navbar() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { username } = useAuth()
    const role = localStorage.getItem('role')
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        await dispatch(logoutThunk())
        navigate(ROUTES.LOGIN)
    }

    const isAttemptPage = pathname.startsWith('/attempt')

    return (
        <header className="navbar">
            <div className={`navbar-inner ${isAttemptPage ? 'is-fluid' : 'container'}`}>
                <div className="navbar-left">
                    {isAttemptPage ? (
                        <button
                            className="btn btn-ghost btn-sm navbar-back"
                            onClick={() => navigate(ROUTES.ASSIGNMENTS)}
                        >
                            &larr; Back
                        </button>
                    ) : (
                        <div className="navbar-brand" onClick={() => navigate(ROUTES.ASSIGNMENTS)}>
                            <span className="navbar-logo">S</span>
                            <span className="navbar-logo-text">SQL Editor</span>
                        </div>
                    )}
                </div>

                <div className="navbar-right">
                    <div className={`navbar-overlay ${isMenuOpen ? 'is-open' : ''}`} onClick={() => setIsMenuOpen(false)} />

                    <div className={`navbar-actions ${isMenuOpen ? 'is-open' : ''}`}>
                        <div className="navbar-user">
                            <span className="navbar-username">{username}</span>

                            {/* Only show "Admin Panel" button if user has role and is NOT already in admin section */}
                            {(role === 'admin' || role === 'superadmin') && !pathname.startsWith('/admin') && (
                                <button
                                    className="btn btn-ghost btn-sm navbar-admin-btn"
                                    onClick={() => navigate(ROUTES.ADMIN)}
                                >
                                    Admin Panel
                                </button>
                            )}

                            {/* If in admin section, show the management links */}
                            {pathname.startsWith('/admin') && (
                                <>
                                    <button
                                        className="btn btn-ghost btn-sm navbar-admin-btn"
                                        onClick={() => navigate(ROUTES.ASSIGNMENTS)}
                                    >
                                        User Panel
                                    </button>
                                    <button
                                        className={`btn btn-ghost btn-sm navbar-admin-btn ${pathname === ROUTES.ADMIN_ASSIGNMENTS ? 'is-active' : ''}`}
                                        onClick={() => navigate(ROUTES.ADMIN_ASSIGNMENTS)}
                                    >
                                        Assignments
                                    </button>
                                    <button
                                        className={`btn btn-ghost btn-sm navbar-admin-btn ${pathname === ROUTES.ADMIN_TESTCASES ? 'is-active' : ''}`}
                                        onClick={() => navigate(ROUTES.ADMIN_TESTCASES)}
                                    >
                                        Testcases
                                    </button>
                                    <button
                                        className={`btn btn-ghost btn-sm navbar-admin-btn ${pathname === ROUTES.ADMIN_USERS ? 'is-active' : ''}`}
                                        onClick={() => navigate(ROUTES.ADMIN_USERS)}
                                    >
                                        Users
                                    </button>
                                    {role === 'superadmin' && (
                                        <button
                                            className={`btn btn-ghost btn-sm navbar-admin-btn ${pathname === ROUTES.ADMIN_ADMINS ? 'is-active' : ''}`}
                                            onClick={() => navigate(ROUTES.ADMIN_ADMINS)}
                                        >
                                            Admins
                                        </button>
                                    )}
                                    <a
                                        className="btn btn-ghost btn-sm navbar-admin-btn"
                                        href={(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '') + '/admin/queues'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Queue
                                    </a>
                                </>
                            )}

                            <button className="btn btn-ghost btn-sm navbar-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>

                    {!isAttemptPage && (
                        <button
                            className={`navbar-toggle ${isMenuOpen ? 'is-active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}
