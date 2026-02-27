import { useAppSelector } from './useRedux'

export function useAuth() {
    return useAppSelector((s) => s.auth)
}
