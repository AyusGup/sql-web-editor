import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { ProtectedRoute } from './routes/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AssignmentListPage from './pages/assignments/AssignmentListPage'
import AttemptPage from './pages/attempt/AttemptPage'
import { ROUTES } from './constants/routes'
import './styles/main.scss'

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.ASSIGNMENTS} element={<AssignmentListPage />} />
              <Route path={ROUTES.ATTEMPT} element={<AttemptPage />} />
            </Route>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.ASSIGNMENTS} replace />} />
            <Route path="*" element={<Navigate to={ROUTES.ASSIGNMENTS} replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  )
}
