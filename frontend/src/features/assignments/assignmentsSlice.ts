import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { assignmentApi } from '../../services/assignmentApi'
import type { ListParams } from '../../services/assignmentApi'
import type { AssignmentListItem, Assignment, UserProgress } from '../../types/assignment'
import type { Pagination } from '../../types/api'
import { QUERY } from '../../constants/query'
import { executeQueryThunk } from '../editor/editorSlice'

interface AssignmentsState {
    list: AssignmentListItem[]
    pagination: Pagination | null
    currentAssignment: Assignment | null
    progress: UserProgress | null
    loading: boolean
    detailLoading: boolean
    error: string | null
}

const initialState: AssignmentsState = {
    list: [],
    pagination: null,
    currentAssignment: null,
    progress: null,
    loading: false,
    detailLoading: false,
    error: null,
}

export const fetchAssignments = createAsyncThunk(
    'assignments/fetchList',
    async (params: ListParams = {}, { rejectWithValue }) => {
        try {
            const merged = { page: QUERY.DEFAULT_PAGE, limit: QUERY.DEFAULT_LIMIT, ...params }
            const res = await assignmentApi.list(merged)
            return res.data.data as { data: AssignmentListItem[]; pagination: Pagination }
        } catch {
            return rejectWithValue('Failed to load assignments')
        }
    }
)

export const fetchAssignment = createAsyncThunk(
    'assignments/fetchOne',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await assignmentApi.get(id)
            return res.data.data as { result: Assignment; progress: UserProgress | null }
        } catch {
            return rejectWithValue('Assignment not found')
        }
    }
)

const assignmentsSlice = createSlice({
    name: 'assignments',
    initialState,
    reducers: {
        clearCurrentAssignment(state) {
            state.currentAssignment = null
            state.progress = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssignments.pending, (state) => { state.loading = true; state.error = null })
            .addCase(fetchAssignments.fulfilled, (state, { payload }) => {
                state.loading = false
                state.list = payload.data
                state.pagination = payload.pagination
            })
            .addCase(fetchAssignments.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload as string
            })
            .addCase(fetchAssignment.pending, (state) => { state.detailLoading = true; state.error = null })
            .addCase(fetchAssignment.fulfilled, (state, { payload }) => {
                state.detailLoading = false
                state.currentAssignment = payload.result
                state.progress = payload.progress
            })
            .addCase(fetchAssignment.rejected, (state, { payload }) => {
                state.detailLoading = false
                state.error = payload as string
            })
            .addCase(executeQueryThunk.fulfilled, (state, { payload }) => {
                if (payload.grading.correct && state.progress) {
                    state.progress.isCompleted = true;
                }
            })
    },
})

export const { clearCurrentAssignment } = assignmentsSlice.actions
export default assignmentsSlice.reducer
