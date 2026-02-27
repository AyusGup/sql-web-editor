import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../../services/authApi'
import type { AuthState, AuthPayload } from '../../types/auth'

const STORED_USER = localStorage.getItem('username')

const initialState: AuthState = {
    username: STORED_USER || null,
    isAuthenticated: !!STORED_USER,
    loading: false,
    error: null,
}

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (payload: AuthPayload, { rejectWithValue }) => {
        try {
            const res = await authApi.login(payload)
            return res.data.username as string
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } }
            return rejectWithValue(e.response?.data?.error || 'Login failed')
        }
    }
)

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (payload: AuthPayload, { rejectWithValue }) => {
        try {
            const res = await authApi.register(payload)
            return res.data.user.username as string
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } }
            return rejectWithValue(e.response?.data?.error || 'Registration failed')
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
            state.isAuthenticated = false
            localStorage.removeItem('username')
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null })
            .addCase(loginThunk.fulfilled, (state, { payload }) => {
                state.loading = false
                state.username = payload
                state.isAuthenticated = true
                localStorage.setItem('username', payload)
            })
            .addCase(loginThunk.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload as string
            })
            .addCase(registerThunk.pending, (state) => { state.loading = true; state.error = null })
            .addCase(registerThunk.fulfilled, (state, { payload }) => {
                state.loading = false
                state.username = payload
                state.isAuthenticated = true
                localStorage.setItem('username', payload)
            })
            .addCase(registerThunk.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload as string
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.username = null
                state.isAuthenticated = false
                localStorage.removeItem('username')
            })
    },
})

export const { clearError, logout } = authSlice.actions
export default authSlice.reducer
