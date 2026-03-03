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
                    <div className="navbar-user">
                        <span className="navbar-username">{username}</span>
                        <button className="btn btn-ghost btn-sm navbar-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
