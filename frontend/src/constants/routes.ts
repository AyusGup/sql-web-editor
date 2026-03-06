export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ASSIGNMENTS: '/assignments',
    ATTEMPT: '/attempt/:id',
    attemptPath: (id: string) => `/attempt/${id}`,

    ADMIN: '/admin',
    ADMIN_ASSIGNMENTS: '/admin/assignments',
    ADMIN_TESTCASES: '/admin/testcases',
    ADMIN_USERS: '/admin/users',
    ADMIN_ADMINS: '/admin/admins',
} as const
