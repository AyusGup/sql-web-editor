import api from './axios'
import { API_ROUTES } from '../constants/api'
import type { AuthPayload } from '../types/auth'

export const authApi = {
    login: (body: AuthPayload) => api.post(API_ROUTES.AUTH.LOGIN, body),
    register: (body: AuthPayload) => api.post(API_ROUTES.AUTH.REGISTER, body),
    logout: () => api.post(API_ROUTES.AUTH.LOGOUT),
    save: (assignmentId: string, sqlQuery: string) =>
        api.post(API_ROUTES.AUTH.SAVE, { assignmentId, sqlQuery }),
}
