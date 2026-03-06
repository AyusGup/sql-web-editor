import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import assignmentsReducer from '../features/assignments/assignmentsSlice'
import editorReducer from '../features/editor/editorSlice'
import saveReducer from '../features/save/saveSlice'
import adminReducer from '../features/admin/adminSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        assignments: assignmentsReducer,
        editor: editorReducer,
        save: saveReducer,
        admin: adminReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
