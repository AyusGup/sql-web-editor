import api from './axios'
import type { PaginatedUserResponse } from '../types/user'
import { QUERY } from '../constants/query'

const API_BASE = '/api/v1/superadmin'

export const superadminApi = {
    listAdmins: async (page = 1, limit = QUERY.ADMIN_LIMIT) => {
        const res = await api.get<PaginatedUserResponse>(`${API_BASE}/admins`, {
            params: { page, limit }
        })
        return res.data
    },

    updateUserRole: async (userId: string, role: 'user' | 'admin' | 'superadmin') => {
        const res = await api.patch(`${API_BASE}/users/${userId}/role`, { role })
        return res.data
    },

    deleteUser: async (userId: string) => {
        const res = await api.delete(`${API_BASE}/users/${userId}`)
        return res.data
    }
}
