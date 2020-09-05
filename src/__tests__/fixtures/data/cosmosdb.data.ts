export class CosmosdbRequestLimitError extends Error {
    code: number;

    constructor(message = cosmosdbRequestLimitMessage) {
        super(message);
        this.code = 16500;
    }
}

export const cosmosdbRetryAfterMs = 10;

export const cosmosdbRequestLimitMessage =
    `Error=16500, RetryAfterMs=${cosmosdbRetryAfterMs}, Details='Response status code does` +
    "not indicate success: TooManyRequests (429); Substatus: 3200; ActivityId: " +
    '5c6abbea-3ed7-49d8-a40b-2cbfcbc1d13a; Reason: ({\r\n  "Errors": [\r\n    ' +
    "Request rate is large. More Request Units may be needed, so no changes were made." +
    'Please retry this request later. Learn more: http://aka.ms/cosmosdb-error-429"\r\n  ]\r\n});';

export const cosmosdbRequestLimitError = new CosmosdbRequestLimitError();
