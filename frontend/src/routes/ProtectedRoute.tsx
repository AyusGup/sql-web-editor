import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../constants/routes'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export function ProtectedRoute({ adminOnly = false, superadminOnly = false }: { adminOnly?: boolean, superadminOnly?: boolean }) {
    const { isAuthenticated, role } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    if (superadminOnly && role !== 'superadmin') {
        return <Navigate to={ROUTES.ASSIGNMENTS} replace />
    }

    if (adminOnly && role !== 'admin' && role !== 'superadmin') {
        return <Navigate to={ROUTES.ASSIGNMENTS} replace />
    }

    const { pathname } = useLocation()
    const isAttemptPage = pathname.startsWith('/attempt')

    return (
        <div className="protected-layout">
            <Navbar />
            <main className="protected-content">
                <Outlet />
                {!isAttemptPage && <Footer />}
            </main>
        </div>
    )
}
