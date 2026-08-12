export const API_PREFIX = "/api" as const;

export const API_MOUNT = {
    auth: `/auth`,
    buildings: `/buildings`,
    floorPlans: `/floor-plans`,
} as const;

export const API_SEGMENT = {
    AUTH: {
        SESSION: {path: '/session'},
        SIGN_IN: {path: '/sign-in'},
        SIGN_UP: {path: '/sign-up'},
        SIGN_OUT: {path: '/sign-out'},
    },
    BUILDINGS: {
        LIST: {path: '/'},
        MY: {path: '/my'},
    },
    FLOOR_PLANS: {
        LIST: {path: '/'},
        CURRENT: {path: '/current'},
    },
} as const;

export const ROUTES = {
    HOME: {path: '/'},
    BUILDINGS: {path: '/buildings'},
    BUILDER: {path: '/builder'},
    FLOOR: {path: '/floor'},
    LOGIN: {path: '/auth/login'},
    MY_BUILDINGS: {path: '/my-buildings'},
    PROFILE: {path: '/profile'},
    RESERVATIONS: {path: '/reservations'},
};

export const BLOCKED_DURING_AUTH_LIST = [
    ROUTES.LOGIN.path,
] as const;

export const AUTH_REQUIRED_PAGES_LIST = [
    ROUTES.BUILDINGS.path,
    ROUTES.BUILDER.path,
    ROUTES.FLOOR.path,
    ROUTES.MY_BUILDINGS.path,
    ROUTES.PROFILE.path,
    ROUTES.RESERVATIONS.path,
] as const;

export const ADMIN_REQUIRED_PAGES_LIST = [] as const;

export const QUERIES = {
    ERROR_TOAST: "error_toast",
    ERROR_AUTH_TOAST: "error_auth_toast",
    AUTH_NEEDED: "auth_needed",
} as const;

export const ROOT_QUERIES = [
    QUERIES.ERROR_TOAST,
    QUERIES.AUTH_NEEDED,
    QUERIES.ERROR_AUTH_TOAST
];

export const COUNSUME_QUERIES = [ 
    QUERIES.ERROR_TOAST,
    QUERIES.AUTH_NEEDED,
    QUERIES.ERROR_AUTH_TOAST
];
