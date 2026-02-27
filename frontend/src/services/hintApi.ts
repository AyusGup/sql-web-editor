import api from './axios'
import { API_ROUTES } from '../constants/api'

export const hintApi = {
    get: (problemId: string, userQuery: string) =>
        api.post(API_ROUTES.HINT.GET, { problemId, userQuery }),
}
