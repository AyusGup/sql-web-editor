export interface AuthPayload {
    username: string
    password: string
}

export interface AuthState {
    username: string | null
    isAuthenticated: boolean
    loading: boolean
    error: string | null
}
