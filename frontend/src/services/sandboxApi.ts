import api from './axios'
import { API_ROUTES } from '../constants/api'

export const sandboxApi = {
    run: (assignmentId: string, query: string) =>
        api.post(API_ROUTES.SANDBOX.RUN, { assignmentId, query }),
    submit: (assignmentId: string, query: string) =>
        api.post(API_ROUTES.SANDBOX.SUBMIT, { assignmentId, query }),
}
