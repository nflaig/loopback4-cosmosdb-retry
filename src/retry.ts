import { ErrorResponse } from "./types";
import { getEnvNumber, getEnvBoolean } from "./utils";

export const MAX_RETRIES = getEnvNumber("MAX_RETRIES", 9);
export const RETRY_AFTER_IN_MS = getEnvNumber("RETRY_AFTER_IN_MS", 1000);
export const RETRY_AFTER_PADDING_IN_MS = getEnvNumber("RETRY_AFTER_PADDING_IN_MS", 0);
export const USE_FIXED_RETRY_INTERVAL = getEnvBoolean("USE_FIXED_RETRY_INTERVAL", false);

export class TooManyRequestsError extends Error {
    code?: string;
    statusCode?: number;
    details: {
        retryAfterInMs?: number;
    };

    constructor(retryAfterInMs?: number) {
        super("Too many requests, please try again later.");
        this.name = this.constructor.name;
        this.code = "TOO_MANY_REQUESTS";
        this.statusCode = 429;
        this.details = { retryAfterInMs };
    }
}

export function shouldRetry(error?: any): boolean {
    const retryErrorCode = 16500;

    if (isError(error)) {
        return error.code === retryErrorCode;
    } else if (isErrorArray(error)) {
        return error[0].code === retryErrorCode;
    } else {
        return false;
    }
}

export function getDelayInMs(error?: any, retryAfterPaddingInMs = 0): number | undefined {
    if (isError(error)) {
        // get suggested wait period from error response
        return getRetryAfterMs(error.message, retryAfterPaddingInMs);
    } else if (isErrorArray(error)) {
        // use default wait period
        return;
    }
}

export function getRetryAfterMs(
    errorMessage: string,
    retryAfterPaddingInMs = 0
): number | undefined {
    if (typeof errorMessage !== "string") return;

    const matcher = /RetryAfterMs=[0-9]*/;

    const result = errorMessage.match(matcher);

    if (!result) return;

    const retryAfterInMs = result[0].split("=")[1];

    return retryAfterInMs ? Number(retryAfterInMs) + retryAfterPaddingInMs : undefined;
}

export function getErrorMessage(error?: any): string | undefined {
    if (isError(error)) {
        return error.message;
    } else if (isErrorArray(error)) {
        return error[0].message;
    }
}

export function isError(error?: any): error is ErrorResponse {
    return typeof error?.code === "number";
}

export function isErrorArray(error?: any): error is ErrorResponse[] {
    return Array.isArray(error) && typeof error[0]?.code === "number";
}
