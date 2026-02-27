const BASE = '/api/v1'

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${BASE}/user/login`,
        REGISTER: `${BASE}/user/register`,
        LOGOUT: `${BASE}/user/logout`,
        SAVE: `${BASE}/user/save`,
    },
    ASSIGNMENTS: {
        LIST: `${BASE}/assignment/list`,
        GET: `${BASE}/assignment`,
    },
    SANDBOX: {
        EXECUTE: `${BASE}/sandbox/execute`,
    },
    HINT: {
        GET: `${BASE}/hint`,
    },
} as const
