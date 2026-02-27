import type { Difficulty } from '../constants/query'

export interface Column {
    columnName: string
    dataType: string
}

export interface SampleTable {
    tableName: string
    columns: Column[]
    rows: Record<string, unknown>[]
}

export interface ExpectedOutput {
    type: 'table' | 'single_value' | 'column' | 'count'
    value: unknown
}

export interface Assignment {
    _id: string
    title: string
    difficulty: Difficulty
    question: string
    sampleTables: SampleTable[]
    expectedOutput: ExpectedOutput
    tags: string[]
    createdAt: string
}

export interface UserProgress {
    sqlQuery: string
    isCompleted: boolean
    attemptCount: number
    lastAttempt: string
}

export interface Grading {
    correct: boolean
    message: string
}

export interface ExecuteResult {
    rows: Record<string, unknown>[]
    grading: Grading
}

export interface AssignmentListItem {
    _id: string
    title: string
    difficulty: Difficulty
    tags: string[]
    createdAt: string
}
