import { expect } from "@loopback/testlab";
import {
    shouldRetry,
    getDelayInMs,
    getRetryAfterMs,
    getErrorMessage,
    isError,
    isErrorArray
} from "../../retry";
import {
    cosmosdbRequestLimitError,
    cosmosdbRetryAfterMs,
    cosmosdbRequestLimitMessage
} from "../fixtures/data";

describe("Retry (unit)", () => {
    class ErrorWithInvalidCode extends Error {
        code = "shouldBeANumber";
    }

    const unknownError = new Error("something failed");
    const errorWithInvalidCode = new ErrorWithInvalidCode("code should be a number");

    describe("shouldRetry()", () => {
        it("should return true if a Cosmos DB request limit error is provided", () => {
            const retry = shouldRetry(cosmosdbRequestLimitError);

            expect(retry).to.equal(true);
        });

        it("should return true if a Cosmos DB request limit error is provided as an array", () => {
            const retry = shouldRetry([cosmosdbRequestLimitError, cosmosdbRequestLimitError]);

            expect(retry).to.equal(true);
        });

        it("should return false if an unknown error is provided", () => {
            const retry = shouldRetry(unknownError);

            expect(retry).to.equal(false);
        });
    });

    describe("getDelayInMs()", () => {
        it("should return the delay based on the RetryAfterMs value in the Cosmos DB request limit error", () => {
            const delay = getDelayInMs(cosmosdbRequestLimitError);

            expect(delay).to.equal(cosmosdbRetryAfterMs);
        });

        it("should return undefined if an array of errors is provided", () => {
            const delay = getDelayInMs([cosmosdbRequestLimitError, cosmosdbRequestLimitError]);

            expect(delay).to.be.undefined();
        });

        it("should return undefined if an unknown error is provided", () => {
            const delay = getDelayInMs(unknownError);

            expect(delay).to.be.undefined();
        });
    });

    describe("getRetryAfterMs()", () => {
        it("should retrieve and return the RetryAfterMs value from the Cosmos DB request limit error message", () => {
            const retryAfterInMs = getRetryAfterMs(cosmosdbRequestLimitMessage);

            expect(retryAfterInMs).to.equal(cosmosdbRetryAfterMs);
        });

        it("should add the padding to the returned RetryAfterMs value", () => {
            const retryAfterPaddingInMs = 10;
            const retryAfterInMs = getRetryAfterMs(
                cosmosdbRequestLimitMessage,
                retryAfterPaddingInMs
            );

            expect(retryAfterInMs).to.equal(cosmosdbRetryAfterMs + retryAfterPaddingInMs);
        });

        it("should return undefined if an unknown error message is provided", () => {
            const retryAfterInMs = getRetryAfterMs(unknownError.message);

            expect(retryAfterInMs).to.be.undefined();
        });

        it("should return undefined if an unknown error message is not a string", () => {
            const retryAfterInMs = getRetryAfterMs(<string>{});

            expect(retryAfterInMs).to.be.undefined();
        });

        it("should return undefined if RetryAfterMs is not a number", () => {
            const retryAfterInMs = getRetryAfterMs("RetryAfterMs=DefinitelyNotANumber");

            expect(retryAfterInMs).to.be.undefined();
        });
    });

    describe("getErrorMessage()", () => {
        it("should return the message of the provided error", () => {
            const message = getErrorMessage(cosmosdbRequestLimitError);

            expect(message).to.equal(cosmosdbRequestLimitError.message);
        });

        it("should return the message if the error is provided as an array", () => {
            const message = getErrorMessage([cosmosdbRequestLimitError]);

            expect(message).to.equal(cosmosdbRequestLimitError.message);
        });

        it("should return undefined if an unknown error is provided", () => {
            const message = getErrorMessage(unknownError);

            expect(message).to.be.undefined();
        });

        it("should return undefined if an unknown error is provided as an array", () => {
            const message = getDelayInMs([unknownError]);

            expect(message).to.be.undefined();
        });

        it("should return undefined if array is empty", () => {
            const message = getDelayInMs([]);

            expect(message).to.be.undefined();
        });
    });

    describe("isError()", () => {
        it("should return true if the provided error is a proper error response", () => {
            const isErrorResponse = isError(cosmosdbRequestLimitError);

            expect(isErrorResponse).to.equal(true);
        });

        it("should return false if an unknown error is provided", () => {
            const isErrorResponse = isError(unknownError);

            expect(isErrorResponse).to.equal(false);
        });

        it("should return false if an error with an invalid code type is provided", () => {
            const isErrorResponse = isError(errorWithInvalidCode);

            expect(isErrorResponse).to.equal(false);
        });

        it("should return false if the provided error is undefined", () => {
            const isErrorResponse = isError(undefined);

            expect(isErrorResponse).to.equal(false);
        });
    });

    describe("isErrorArray()", () => {
        it("should return true if the provided error is a proper error response as array", () => {
            const isErrorResponseArray = isErrorArray([cosmosdbRequestLimitError]);

            expect(isErrorResponseArray).to.equal(true);
        });

        it("should return false if an unknown error is provided as array", () => {
            const isErrorResponseArray = isErrorArray([unknownError]);

            expect(isErrorResponseArray).to.equal(false);
        });

        it("should return false if an error with an invalid code type is provided as array", () => {
            const isErrorResponseArray = isErrorArray([errorWithInvalidCode]);

            expect(isErrorResponseArray).to.equal(false);
        });

        it("should return false if array is empty", () => {
            const isErrorResponseArray = isErrorArray([]);

            expect(isErrorResponseArray).to.equal(false);
        });

        it("should return false if the provided error is not an array", () => {
            const isErrorResponseArray = isErrorArray(cosmosdbRequestLimitError);

            expect(isErrorResponseArray).to.equal(false);
        });
    });
});
