import api from './axios'
import { API_ROUTES } from '../constants/api'
import type { Difficulty } from '../constants/query'

export interface ListParams {
    page?: number
    limit?: number
    difficulty?: Difficulty | ''
    tags?: string[]
}

export const assignmentApi = {
    list: (params: ListParams) =>
        api.get(API_ROUTES.ASSIGNMENTS.LIST, { params }),
    get: (id: string) =>
        api.get(API_ROUTES.ASSIGNMENTS.GET, { params: { id } }),
}
