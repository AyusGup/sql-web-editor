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
        RUN: `${BASE}/sandbox/run`,
        SUBMIT: `${BASE}/sandbox/submit`,
    },
    HINT: {
        GET: `${BASE}/hint`,
    },
    ADMIN: {
        BASE: `${BASE}/admin`,
        SUMMARY: `${BASE}/admin/summary`,
        USERS: `${BASE}/admin/users`,
        SEARCH_USERS: `${BASE}/admin/users/search`,
        ASSIGNMENTS: `${BASE}/admin/assignments`,
        SEARCH_ASSIGNMENTS: `${BASE}/admin/assignments/search`,
        TESTCASES: `${BASE}/admin/testcases`,
        SYNC_LINKS: (testcaseId: string) =>
            `${BASE}/admin/testcases/${testcaseId}/links`,
    },
} as const;
