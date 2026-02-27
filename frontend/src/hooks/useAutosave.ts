import { useEffect, useRef } from 'react'
import { useAppDispatch } from './useRedux'
import { setSaving, setSaved, setSaveError } from '../features/save/saveSlice'
import { SAVE_STATUS } from '../constants/ui'

export function useAutosave(assignmentId: string | undefined, query: string) {
    const dispatch = useAppDispatch()
    const workerRef = useRef<Worker | null>(null)
    const isFirstRun = useRef(true)

    useEffect(() => {
        const worker = new Worker(
            new URL('../workers/autosave.worker.ts', import.meta.url),
            { type: 'module' }
        )
        workerRef.current = worker

        worker.onmessage = (e: MessageEvent<{ status: string }>) => {
            const { status } = e.data
            if (status === SAVE_STATUS.SAVING) {
                dispatch(setSaving())
            } else if (status === SAVE_STATUS.SAVED) {
                dispatch(setSaved(new Date().toISOString()))
            } else {
                dispatch(setSaveError())
            }
        }

        return () => {
            worker.terminate()
            workerRef.current = null
        }
    }, [dispatch])

    useEffect(() => {
        // Skip the very first run
        if (isFirstRun.current) {
            isFirstRun.current = false
            return
        }

        if (!assignmentId || !query.trim()) return

        // worker handles the 2s debounce timer
        workerRef.current?.postMessage({ assignmentId, sqlQuery: query })
    }, [assignmentId, query, dispatch])
}
