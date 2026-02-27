import api from './axios'
import { API_ROUTES } from '../constants/api'

export const sandboxApi = {
    execute: (assignmentId: string, query: string) =>
        api.post(API_ROUTES.SANDBOX.EXECUTE, { assignmentId, query }),
}
