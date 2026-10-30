// Generated from the API's OpenAPI document. Do not edit.

export interface paths {
    "/api/v1/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_live_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_ready_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Problem: {
            type: string;
            title: string;
            status: number;
            detail?: string;
            instance?: string;
            /** @enum {string} */
            code: "VALIDATION_FAILED" | "MALFORMED_JSON" | "UNAUTHENTICATED" | "PERMISSION_DENIED" | "RESOURCE_NOT_FOUND" | "METHOD_NOT_ALLOWED" | "CONFLICT" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE" | "BUSINESS_RULE_VIOLATION" | "RATE_LIMITED" | "INTERNAL_ERROR" | "DEPENDENCY_UNAVAILABLE";
            i18nKey: string;
            requestId?: string;
            errors?: {
                pointer?: string;
                parameter?: string;
                code: string;
                i18nKey?: string;
                params?: {
                    [key: string]: unknown;
                };
            }[];
        } & {
            [key: string]: unknown;
        };
        HealthLive: {
            /** @enum {string} */
            status: "ok";
        };
        HealthReady: {
            /** @enum {string} */
            status: "ok";
            checks: {
                [key: string]: "ok" | "fail";
            };
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    HealthController_live_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Process is running */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthLive"];
                };
            };
        };
    };
    HealthController_ready_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description All dependencies are usable */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthReady"];
                };
            };
            /** @description A dependency check failed */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
}
