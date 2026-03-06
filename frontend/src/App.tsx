import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { ToastProvider } from './components/common/Toast'
import { ProtectedRoute } from './routes/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AssignmentListPage from './pages/assignments/AssignmentListPage'
import AttemptPage from './pages/attempt/AttemptPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminAssignmentsPage from './pages/admin/AdminAssignmentsPage'
import AdminTestcasesPage from './pages/admin/AdminTestcasesPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import AdminManagementPage from './pages/superadmin/AdminManagementPage'
import { ROUTES } from './constants/routes'
import './styles/main.scss'

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path={ROUTES.ASSIGNMENTS} element={<AssignmentListPage />} />
                <Route path={ROUTES.ATTEMPT} element={<AttemptPage />} />
              </Route>

              <Route element={<ProtectedRoute adminOnly />}>
                <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
                <Route path={ROUTES.ADMIN_USERS} element={<UserManagementPage />} />
                <Route path={ROUTES.ADMIN_ASSIGNMENTS} element={<AdminAssignmentsPage />} />
                <Route path={ROUTES.ADMIN_TESTCASES} element={<AdminTestcasesPage />} />
              </Route>
              <Route element={<ProtectedRoute superadminOnly />}>
                <Route path={ROUTES.ADMIN_ADMINS} element={<AdminManagementPage />} />
              </Route>
              <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.ASSIGNMENTS} replace />} />
              <Route path="*" element={<Navigate to={ROUTES.ASSIGNMENTS} replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ErrorBoundary>
    </Provider>
  )
}
