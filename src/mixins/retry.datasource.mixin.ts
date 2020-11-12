import { juggler } from "@loopback/repository";
import {
    MAX_RETRIES,
    RETRY_AFTER_IN_MS,
    RETRY_AFTER_PADDING_IN_MS,
    USE_FIXED_RETRY_INTERVAL,
    shouldRetry,
    getDelayInMs,
    TooManyRequestsError
} from "../retry";
import { MixinTarget } from "../types";

export function RetryMixin<T extends MixinTarget<juggler.DataSource>>(dataSourceClass: T) {
    class RetryDataSource extends dataSourceClass {
        maxRetries: number;
        retryAfterInMs: number;
        retryAfterPaddingInMs: number;
        useFixedRetryInterval: boolean;

        constructor(...args: any[]) {
            super(...args);

            this.maxRetries = MAX_RETRIES;
            this.retryAfterInMs = RETRY_AFTER_IN_MS;
            this.retryAfterPaddingInMs = RETRY_AFTER_PADDING_IN_MS;
            this.useFixedRetryInterval = USE_FIXED_RETRY_INTERVAL;

            const connector = this.connector!;
            // save the original `execute` implementation
            connector._originalExecute = connector.execute;
            // inject custom version of `execute`
            (connector.execute as (...params: any[]) => any) = (...params: unknown[]) => {
                // connectors are still callback-based, LB4 type definitions are incorrect
                const callback = params.pop() as Function;

                let attempt = 1;

                const retryCallback = (error: unknown, ...results: unknown[]) => {
                    if (!error) {
                        // no error occurred, operation was successful
                        callback(error, ...results);
                        return;
                    }

                    if (!shouldRetry(error)) {
                        // unknown error, report it back to the caller
                        callback(error, ...results);
                        return;
                    }

                    const delay = this.useFixedRetryInterval
                        ? this.retryAfterInMs
                        : getDelayInMs(error, this.retryAfterPaddingInMs) ?? this.retryAfterInMs;

                    if (attempt <= this.maxRetries) {
                        attempt++;
                        setTimeout(
                            () => connector._originalExecute(...params, retryCallback),
                            delay
                        );
                    } else {
                        callback(new TooManyRequestsError(delay), ...results);
                    }
                };

                // forward the arguments provided by the caller
                // but use custom callback to intercept the outcome
                connector._originalExecute(...params, retryCallback);
            };
        }
    }
    return RetryDataSource;
}
