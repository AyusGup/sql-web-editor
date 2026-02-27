import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { sandboxApi } from '../../services/sandboxApi'
import { hintApi } from '../../services/hintApi'
import type { ExecuteResult } from '../../types/assignment'

interface EditorState {
    query: string
    result: ExecuteResult | null
    hint: string | null
    executing: boolean
    hintLoading: boolean
    executeError: string | null
    hintError: string | null
}

const initialState: EditorState = {
    query: '',
    result: null,
    hint: null,
    executing: false,
    hintLoading: false,
    executeError: null,
    hintError: null,
}

export const executeQueryThunk = createAsyncThunk(
    'editor/execute',
    async ({ assignmentId, query }: { assignmentId: string; query: string }, { rejectWithValue }) => {
        try {
            const res = await sandboxApi.execute(assignmentId, query)
            return res.data.data as ExecuteResult
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } }
            return rejectWithValue(e.response?.data?.message || 'Query execution failed')
        }
    }
)

export const getHintThunk = createAsyncThunk(
    'editor/getHint',
    async (
        { problemId, userQuery }: { problemId: string; userQuery: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await hintApi.get(problemId, userQuery)
            return res.data.data.hint as string
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { message?: string } } }
            if (e.response?.status === 429) return rejectWithValue('Rate limit reached. Please wait.')
            return rejectWithValue(e.response?.data?.message || 'Failed to get hint')
        }
    }
)

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setQuery(state, action: PayloadAction<string>) { state.query = action.payload },
        clearResult(state) { state.result = null; state.executeError = null },
        clearHint(state) { state.hint = null; state.hintError = null },
        resetEditor() { return initialState },
    },
    extraReducers: (builder) => {
        builder
            .addCase(executeQueryThunk.pending, (state) => { state.executing = true; state.executeError = null })
            .addCase(executeQueryThunk.fulfilled, (state, { payload }) => {
                state.executing = false
                state.result = payload
            })
            .addCase(executeQueryThunk.rejected, (state, { payload }) => {
                state.executing = false
                state.executeError = payload as string
            })
            .addCase(getHintThunk.pending, (state) => { state.hintLoading = true; state.hintError = null })
            .addCase(getHintThunk.fulfilled, (state, { payload }) => {
                state.hintLoading = false
                state.hint = payload
            })
            .addCase(getHintThunk.rejected, (state, { payload }) => {
                state.hintLoading = false
                state.hintError = payload as string
            })
    },
})

export const { setQuery, clearResult, clearHint, resetEditor } = editorSlice.actions
export default editorSlice.reducer
