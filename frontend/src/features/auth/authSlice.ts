import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../../services/authApi'
import type { AuthState, AuthPayload } from '../../types/auth'

const STORED_USER = localStorage.getItem('username')
const STORED_ROLE = localStorage.getItem('role') as 'user' | 'admin' | null

const initialState: AuthState = {
    username: STORED_USER || null,
    role: STORED_ROLE || null,
    isAuthenticated: !!STORED_USER,
    loading: false,
    error: null,
}

const extractErrorMessage = (err: unknown, defaultMsg: string): string => {
    const e = err as { response?: { data?: { error?: any, message?: string } } }
    const errData = e.response?.data?.error

    if (typeof errData === 'string') return errData
    if (errData?.details?.[0]?.message) return errData.details[0].message
    if (errData?.error) return errData.error
    if (e.response?.data?.message) return e.response.data.message
    return defaultMsg
}

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (payload: AuthPayload, { rejectWithValue }) => {
        try {
            const res = await authApi.login(payload)
            return { username: res.data.data.username, role: res.data.data.role }
        } catch (err: unknown) {
            return rejectWithValue(extractErrorMessage(err, 'Login failed'))
        }
    }
)

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (payload: AuthPayload, { rejectWithValue }) => {
        try {
            const res = await authApi.register(payload)
            return { username: res.data.data.username, role: res.data.data.role }
        } catch (err: unknown) {
            return rejectWithValue(extractErrorMessage(err, 'Registration failed'))
        }
    }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
    await authApi.logout()
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError(state) { state.error = null },
        logout(state) {
            state.username = null
            state.role = null
            state.isAuthenticated = false
            localStorage.removeItem('username')
            localStorage.removeItem('role')
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null })
            .addCase(loginThunk.fulfilled, (state, { payload }) => {
                state.loading = false
                state.username = payload.username
                state.role = payload.role as 'user' | 'admin'
                state.isAuthenticated = true
                localStorage.setItem('username', payload.username)
                localStorage.setItem('role', payload.role)
            })
            .addCase(loginThunk.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload as string
            })
            .addCase(registerThunk.pending, (state) => { state.loading = true; state.error = null })
            .addCase(registerThunk.fulfilled, (state, { payload }) => {
                state.loading = false
                state.username = payload.username
                state.role = payload.role as 'user' | 'admin'
                state.isAuthenticated = true
                localStorage.setItem('username', payload.username)
                localStorage.setItem('role', payload.role)
            })
            .addCase(registerThunk.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload as string
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.username = null
                state.role = null
                state.isAuthenticated = false
                localStorage.removeItem('username')
                localStorage.removeItem('role')
            })
    },
})

export const { clearError, logout } = authSlice.actions
export default authSlice.reducer
