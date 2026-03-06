export const QUERY = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12, // For public-facing grids
    ADMIN_LIMIT: 20,   // For management tables
    SEARCH_THRESHOLD: 2,
    MAX_QUERY_LENGTH: 5000,
    AUTOSAVE_DELAY_MS: 2000,
    DEBOUNCE_DELAY: {
        SEARCH: 500,
        LINK: 300
    }
} as const

export const DIFFICULTY = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
} as const

export type Difficulty = typeof DIFFICULTY[keyof typeof DIFFICULTY]
