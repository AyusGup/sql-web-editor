export interface ManagedUser {
    _id: string
    username: string
    role: 'user' | 'admin' | 'superadmin'
    createdAt: string
}

export interface UserSearchResponse {
    data: ManagedUser[]
}

export interface AdminListResponse {
    data: ManagedUser[]
}

export interface PaginatedUserResponse {
    data: ManagedUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
