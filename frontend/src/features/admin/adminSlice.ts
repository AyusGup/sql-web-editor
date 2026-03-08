import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { adminApi } from '../../services/adminApi'
import type { AdminSummary } from '../../services/adminApi'
import type {
    Assignment,
    Testcase,
    CreateAssignmentDTO,
    UpdateAssignmentDTO,
    CreateTestcaseDTO,
    UpdateTestcaseDTO
} from '../../types/assignment'

interface AdminState {
    summary: AdminSummary | null
    assignments: Assignment[]
    assignmentsPage: number
    assignmentsTotalPages: number
    testcases: Testcase[]
    testcasesPage: number
    testcasesTotalPages: number
    loading: boolean
    error: string | null
}

const initialState: AdminState = {
    summary: null,
    assignments: [],
    assignmentsPage: 1,
    assignmentsTotalPages: 1,
    testcases: [],
    testcasesPage: 1,
    testcasesTotalPages: 1,
    loading: true, // Start as true to prevent initial "No data" flicker
    error: null,
}

export const fetchSummary = createAsyncThunk('admin/fetchSummary', async (_, { rejectWithValue }) => {
    try {
        const res = await adminApi.getSummary()
        return res.data.data
    } catch {
        return rejectWithValue('Failed to fetch summary')
    }
})

export const fetchAssignmentsAdmin = createAsyncThunk('admin/fetchAssignments', async (page: number | void = 1, { rejectWithValue }) => {
    try {
        const res = await adminApi.listAssignments(page ?? 1)
        return res.data.data
    } catch {
        return rejectWithValue('Failed to fetch assignments')
    }
})

export const createAssignmentThunk = createAsyncThunk(
    'admin/createAssignment',
    async (data: CreateAssignmentDTO, { rejectWithValue }) => {
        try {
            const res = await adminApi.createAssignment(data)
            return res.data.data
        } catch {
            return rejectWithValue('Failed to create assignment')
        }
    }
)

export const updateAssignmentThunk = createAsyncThunk(
    'admin/updateAssignment',
    async ({ id, data }: { id: string, data: UpdateAssignmentDTO }, { rejectWithValue }) => {
        try {
            const res = await adminApi.updateAssignment(id, data)
            return res.data.data
        } catch {
            return rejectWithValue('Failed to update assignment')
        }
    }
)

export const deleteAssignmentThunk = createAsyncThunk(
    'admin/deleteAssignment',
    async (id: string, { rejectWithValue }) => {
        try {
            await adminApi.deleteAssignment(id)
            return id
        } catch {
            return rejectWithValue('Failed to delete assignment')
        }
    }
)

export const fetchTestcasesAdmin = createAsyncThunk('admin/fetchTestcases', async (page: number | void = 1, { rejectWithValue }) => {
    try {
        const res = await adminApi.listTestcases(page ?? 1)
        return res.data.data
    } catch {
        return rejectWithValue('Failed to fetch testcases')
    }
})

export const createTestcaseThunk = createAsyncThunk(
    'admin/createTestcase',
    async (data: CreateTestcaseDTO, { rejectWithValue }) => {
        try {
            const res = await adminApi.createTestcase(data)
            return res.data.data
        } catch {
            return rejectWithValue('Failed to create testcase')
        }
    }
)

export const updateTestcaseThunk = createAsyncThunk(
    'admin/updateTestcase',
    async ({ id, data }: { id: string, data: UpdateTestcaseDTO }, { rejectWithValue }) => {
        try {
            const res = await adminApi.updateTestcase(id, data)
            return res.data.data
        } catch {
            return rejectWithValue('Failed to update testcase')
        }
    }
)

export const deleteTestcaseThunk = createAsyncThunk(
    'admin/deleteTestcase',
    async (id: string, { rejectWithValue }) => {
        try {
            await adminApi.deleteTestcase(id)
            return id
        } catch {
            return rejectWithValue('Failed to delete testcase')
        }
    }
)

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError(state) { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSummary.pending, (state) => { state.loading = true })
            .addCase(fetchSummary.fulfilled, (state, { payload }) => {
                state.loading = false
                state.summary = payload
            })
            .addCase(fetchSummary.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload as string
            })
            // Assignments
            .addCase(fetchAssignmentsAdmin.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchAssignmentsAdmin.fulfilled, (state, { payload }) => {
                state.loading = false
                state.assignments = payload.data
                state.assignmentsPage = payload.page
                state.assignmentsTotalPages = payload.totalPages
            })
            .addCase(fetchAssignmentsAdmin.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload as string
            })
            // Testcases
            .addCase(fetchTestcasesAdmin.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchTestcasesAdmin.fulfilled, (state, { payload }) => {
                state.loading = false
                state.testcases = payload.data
                state.testcasesPage = payload.page
                state.testcasesTotalPages = payload.totalPages
            })
            .addCase(fetchTestcasesAdmin.rejected, (state, { payload }) => {
                state.loading = false
                state.error = payload as string
            })
            .addCase(createTestcaseThunk.fulfilled, (state, { payload }) => {
                state.testcases.unshift({ ...payload, linkedAssignments: [] })
            })
            .addCase(updateTestcaseThunk.fulfilled, (state, { payload }) => {
                const idx = state.testcases.findIndex(t => t._id === payload._id)
                if (idx !== -1) {
                    const existing = state.testcases[idx]
                    state.testcases[idx] = { ...payload, linkedAssignments: existing.linkedAssignments }
                }
            })
            .addCase(deleteTestcaseThunk.fulfilled, (state, { payload }) => {
                state.testcases = state.testcases.filter(t => t._id !== payload)
            })
    },
})

export const { clearAdminError } = adminSlice.actions
export default adminSlice.reducer
