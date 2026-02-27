import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { SAVE_STATUS } from '../../constants/ui'
import type { SaveStatus } from '../../constants/ui'

interface SaveState {
    status: SaveStatus
    lastSavedAt: string | null
}

const initialState: SaveState = {
    status: SAVE_STATUS.IDLE,
    lastSavedAt: null,
}

const saveSlice = createSlice({
    name: 'save',
    initialState,
    reducers: {
        setSaving(state) { state.status = SAVE_STATUS.SAVING },
        setSaved(state, action: PayloadAction<string>) {
            state.status = SAVE_STATUS.SAVED
            state.lastSavedAt = action.payload
        },
        setSaveError(state) { state.status = SAVE_STATUS.ERROR },
        resetSave(state) { state.status = SAVE_STATUS.IDLE },
    },
})

export const { setSaving, setSaved, setSaveError, resetSave } = saveSlice.actions
export default saveSlice.reducer
