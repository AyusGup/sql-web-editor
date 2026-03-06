import api from './axios'
import { API_ROUTES } from '../constants/api'
import { QUERY } from '../constants/query'
import type {
    CreateAssignmentDTO,
    UpdateAssignmentDTO,
    CreateTestcaseDTO,
    UpdateTestcaseDTO
} from '../types/assignment'

export interface AdminSummary {
    totalUsers: number
    totalAssignments: number
    totalTestcases: number
}

export const adminApi = {
    getSummary: () => api.get(API_ROUTES.ADMIN.SUMMARY),

    getUsers: (page = 1, limit = QUERY.ADMIN_LIMIT) =>
        api.get(API_ROUTES.ADMIN.USERS, { params: { page, limit } }),
    searchUsers: (q: string) =>
        api.get(API_ROUTES.ADMIN.SEARCH_USERS, { params: { q } }),

    listAssignments: (page = 1, limit = QUERY.ADMIN_LIMIT) =>
        api.get(API_ROUTES.ADMIN.ASSIGNMENTS, { params: { page, limit } }),
    createAssignment: (data: CreateAssignmentDTO) =>
        api.post(API_ROUTES.ADMIN.ASSIGNMENTS, data),
    updateAssignment: (id: string, data: UpdateAssignmentDTO) =>
        api.patch(`${API_ROUTES.ADMIN.ASSIGNMENTS}/${id}`, data),
    deleteAssignment: (id: string) =>
        api.delete(`${API_ROUTES.ADMIN.ASSIGNMENTS}/${id}`),
    searchAssignments: (q: string) =>
        api.get(API_ROUTES.ADMIN.SEARCH_ASSIGNMENTS, { params: { q } }),
    listTestcases: (page = 1, limit = QUERY.ADMIN_LIMIT) =>
        api.get(API_ROUTES.ADMIN.TESTCASES, { params: { page, limit } }),
    createTestcase: (data: CreateTestcaseDTO) =>
        api.post(API_ROUTES.ADMIN.TESTCASES, data),
    updateTestcase: (id: string, data: UpdateTestcaseDTO) =>
        api.patch(`${API_ROUTES.ADMIN.TESTCASES}/${id}`, data),
    deleteTestcase: (id: string) =>
        api.delete(`${API_ROUTES.ADMIN.TESTCASES}/${id}`),
    syncLinks: (testcaseId: string, assignmentIds: string[]) =>
        api.put(API_ROUTES.ADMIN.SYNC_LINKS(testcaseId), { assignmentIds }),
}
