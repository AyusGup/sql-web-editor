import { QUERY } from "../constants/query";

const BASE_URL: string = import.meta.env.VITE_API_URL || self.location.origin
let timer: ReturnType<typeof setTimeout> | null = null

self.onmessage = async (e: MessageEvent<{ assignmentId: string; sqlQuery: string }>) => {
    const { assignmentId, sqlQuery } = e.data

    // Clear any pending timer — only the LAST message within AUTOSAVE_DELAY_MS fires
    if (timer) clearTimeout(timer)

    // Wait AUTOSAVE_DELAY_MS after the last keystroke before starting the save process
    timer = setTimeout(async () => {
        // Signal to UI that we are now actively saving
        self.postMessage({ status: 'saving' })

        try {
            const res = await fetch(`${BASE_URL}/api/v1/user/save`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignmentId, sqlQuery }),
            })
            self.postMessage({ status: res.ok ? 'saved' : 'error' })
        } catch {
            self.postMessage({ status: 'error' })
        }
    }, QUERY.AUTOSAVE_DELAY_MS)
}
