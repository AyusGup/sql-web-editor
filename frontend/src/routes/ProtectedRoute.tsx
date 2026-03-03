import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../constants/routes'
import Navbar from '../components/common/Navbar'

export function ProtectedRoute() {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    return (
        <div className="protected-layout">
            <Navbar />
            <main className="protected-content">
                <Outlet />
            </main>
        </div>
    )
}
