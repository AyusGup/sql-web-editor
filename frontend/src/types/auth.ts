export interface AuthPayload {
    username: string
    password: string
}

export interface AuthState {
    username: string | null
    role: 'user' | 'admin' | 'superadmin' | null
    isAuthenticated: boolean
    loading: boolean
    error: string | null
}
