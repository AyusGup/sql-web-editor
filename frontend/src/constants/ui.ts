export const BREAKPOINTS = {
    XS: 320,
    SM: 641,
    MD: 1024,
    LG: 1281,
} as const

export const SAVE_STATUS = {
    IDLE: 'idle',
    SAVING: 'saving',
    SAVED: 'saved',
    ERROR: 'error',
} as const

export type SaveStatus = typeof SAVE_STATUS[keyof typeof SAVE_STATUS]
