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

export interface LinkedAssignment {
    _id: string
    title: string
}

export interface Testcase {
    _id: string
    sampleTables: SampleTable[]
    expectedOutput: ExpectedOutput
    visible: boolean
    version: number
    linkedAssignments: LinkedAssignment[]
    createdAt: string
    updatedAt: string
}

export interface SearchedAssignment {
    _id: string
    title: string
    difficulty: Difficulty
}

export interface Assignment {
    _id: string
    title: string
    difficulty: Difficulty
    question: string
    testcases: Testcase[]
    tags: string[]
    version: number
    createdAt: string
    updatedAt: string
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

export interface RunResult {
    testcaseId: string
    rows: Record<string, unknown>[]
    grading: Grading
    visible: boolean
}

export interface ExecuteResult {
    type: 'run' | 'submit'
    results: RunResult[]
    grading: Grading
}

export interface AssignmentListItem {
    _id: string
    title: string
    difficulty: Difficulty
    tags: string[]
    createdAt: string
    isCompleted?: boolean
}

// Admin DTOs
export type CreateAssignmentDTO = Omit<Assignment, '_id' | 'testcases' | 'createdAt' | 'updatedAt' | 'version'>
export type UpdateAssignmentDTO = Partial<CreateAssignmentDTO> & { version?: number }

export type CreateTestcaseDTO = Omit<Testcase, '_id' | 'createdAt' | 'updatedAt' | 'linkedAssignments' | 'version'>
export type UpdateTestcaseDTO = Partial<CreateTestcaseDTO> & { version?: number }
