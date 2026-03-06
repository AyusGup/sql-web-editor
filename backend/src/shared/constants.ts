export const TTL = 1800;
export const WINDOW = 60 * 1000;
export const COOKIE_EXPIRY = 30 * 24 * 60 * 60 * 1000;
export const MAX_RETRIES = 2;


export const RATE_LIMITS = {
    USER: 10,
    GLOBAL: 1000
} as const;

export const PAGINATION_LIMITS = {
    DEFAULT: 10,
    ADMIN: 20,
    MAX: 100
} as const;

export const SEARCH_LIMITS = {
    USER: 10,
    ASSIGNMENT: 8,
    MIN_QUERY_LENGTH: 2
} as const;