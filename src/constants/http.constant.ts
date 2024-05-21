const httpStatusConstant = {
    OK: 200,
    CREATED: 201,
    UPDATED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    REDIRECT: 302,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    ACCESS_FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNREGISTERED: 410,
    PAYLOAD_TOO_LARGE: 413,
    CONCURRENT_LIMITED_EXCEEDED: 429,
    CODE_EXPIRED: 498,
    REQUEST_CONFLICT: 409,
    UNPROCESSABLE_CONTENT: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SHUTDOWN: 503,
    INVALID_TOKEN: 419,
    SESSION_EXPIRED: 423, // LOGIN_SESSION_EXPIRED
};
export default httpStatusConstant;
