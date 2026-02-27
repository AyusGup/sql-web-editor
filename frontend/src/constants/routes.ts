export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ASSIGNMENTS: '/assignments',
    ATTEMPT: '/attempt/:id',
    attemptPath: (id: string) => `/attempt/${id}`,
} as const
