import { expect, sinon } from "@loopback/testlab";
import { juggler } from "@loopback/repository";
import { Connector } from "loopback-datasource-juggler";
import { TestDataSource } from "../../helpers";
import {
    cosmosdbRequestLimitError,
    cosmosdbRetryAfterMs,
    CosmosdbRequestLimitError
} from "../../fixtures/data";
import { TooManyRequestsError } from "../../../retry";
import { RetryMixin, CosmosdbRetryMixin } from "../../..";

describe("Retry Mixin (unit)", () => {
    class DataSourceWithRetry extends RetryMixin(TestDataSource) {
        maxRetries = 3;
        retryAfterInMs = cosmosdbRetryAfterMs + 1;
        retryAfterPaddingInMs = 0;
        useFixedRetryInterval = false;
    }

    const originalExecute = "_originalExecute";
    const successResponse = "success";
    const unknownError = new Error("something failed");

    let dataSourceWithRetry: DataSourceWithRetry;
    let connectorWithRetry: Connector;
    let wrappedExecute: () => Promise<any>;
    let tooManyRequestsError: TooManyRequestsError;

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        dataSourceWithRetry = new DataSourceWithRetry();
        connectorWithRetry = dataSourceWithRetry.connector as Connector;
        givenWrappedExecute(connectorWithRetry);
        givenTooManyRequestsError();
    });

    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("should extend the data source class", () => {
        expect(dataSourceWithRetry).to.be.instanceOf(TestDataSource);
        expect(dataSourceWithRetry).to.be.instanceOf(juggler.DataSource);
    });

    it("should add new properties to the data source class", () => {
        expect(dataSourceWithRetry.maxRetries).to.be.a.Number();
        expect(dataSourceWithRetry.retryAfterInMs).to.be.a.Number();
        expect(dataSourceWithRetry.retryAfterPaddingInMs).to.be.a.Number();
        expect(dataSourceWithRetry.useFixedRetryInterval).to.be.a.Boolean();
    });

    it("should export CosmosdbRetryMixin as an alias", () => {
        expect(CosmosdbRetryMixin.toString()).to.equal(RetryMixin.toString());
    });

    it("should not break the execute method of the data source connector", () => {
        expect(() => connectorWithRetry.execute!()).to.throwError(
            "execute() must be implemented by the connector"
        );
    });

    it("should return the result if no error occurres", async () => {
        sandbox.stub(connectorWithRetry, originalExecute).callsArgWith(2, null, successResponse);

        const result = await wrappedExecute();

        expect(result).to.equal(successResponse);
    });

    it("should throw if an unknown error occurres", async () => {
        sandbox.stub(connectorWithRetry, originalExecute).callsArgWith(2, unknownError, null);

        await expect(wrappedExecute()).to.be.rejectedWith(unknownError);
    });

    it("should retry if the operation fails due to too many requests", async () => {
        sandbox
            .stub(connectorWithRetry, originalExecute)
            .onFirstCall()
            .callsArgWith(2, cosmosdbRequestLimitError, null)
            .onSecondCall()
            .callsArgWith(2, null, successResponse);

        const result = await wrappedExecute();

        expect(result).to.equal(successResponse);
    });

    it("should retry if multiple operations fail due to too many requests", async () => {
        sandbox
            .stub(connectorWithRetry, originalExecute)
            .onFirstCall()
            .callsArgWith(2, cosmosdbRequestLimitError, null)
            .onSecondCall()
            .callsArgWith(2, cosmosdbRequestLimitError, null)
            .onThirdCall()
            .callsArgWith(2, null, successResponse);

        const result = await wrappedExecute();

        expect(result).to.equal(successResponse);
    });

    it("should retry if the operation fails due to too many requests with an array of errors", async () => {
        sandbox
            .stub(connectorWithRetry, originalExecute)
            .onFirstCall()
            .callsArgWith(2, [cosmosdbRequestLimitError, cosmosdbRequestLimitError], null)
            .onSecondCall()
            .callsArgWith(2, null, successResponse);

        const result = await wrappedExecute();

        expect(result).to.equal(successResponse);
    });

    it("should throw if the maximum amount of retries is exceeded", async () => {
        sandbox
            .stub(connectorWithRetry, originalExecute)
            .callsArgWith(2, cosmosdbRequestLimitError, null);

        await expect(wrappedExecute()).to.be.rejectedWith(tooManyRequestsError);
    });

    it("should throw an error with the default retryAfterInMs value if error message does not include RetryAfterMs", async () => {
        const error = new CosmosdbRequestLimitError("unknown message");
        givenTooManyRequestsError(dataSourceWithRetry.retryAfterInMs);
        sandbox.stub(connectorWithRetry, originalExecute).callsArgWith(2, error, null);

        await expect(wrappedExecute()).to.be.rejectedWith(tooManyRequestsError);
    });

    it("should throw an error with a fixed retry interval if configured", async () => {
        class DataSourceWithFixedRetryInterval extends DataSourceWithRetry {
            useFixedRetryInterval = true;
        }
        const dataSourceWithFixedRetryInterval = new DataSourceWithFixedRetryInterval();
        const { retryAfterInMs, connector } = dataSourceWithFixedRetryInterval;

        givenWrappedExecute(connector!);
        givenTooManyRequestsError(retryAfterInMs);

        sandbox.stub(connector!, originalExecute).callsArgWith(2, cosmosdbRequestLimitError, null);

        await expect(wrappedExecute()).to.be.rejectedWith(tooManyRequestsError);
    });

    it("should throw an error and add the configured retry padding to the RetryAfterMs value", async () => {
        class DataSourceWithRetryPadding extends DataSourceWithRetry {
            retryAfterPaddingInMs = 5;
        }
        const dataSourceWithRetryPadding = new DataSourceWithRetryPadding();
        const { retryAfterPaddingInMs, connector } = dataSourceWithRetryPadding;

        givenWrappedExecute(connector!);
        givenTooManyRequestsError(cosmosdbRetryAfterMs + retryAfterPaddingInMs);

        sandbox.stub(connector!, originalExecute).callsArgWith(2, cosmosdbRequestLimitError, null);

        await expect(wrappedExecute()).to.be.rejectedWith(tooManyRequestsError);
    });

    function givenWrappedExecute(connector: Connector) {
        wrappedExecute = async () => {
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                connector.execute!("Test", "test", (error: any, res: any) => {
                    if (error) reject(error);
                    else resolve(res);
                });
            });
        };
    }

    function givenTooManyRequestsError(retryAfterInMs: number = cosmosdbRetryAfterMs) {
        tooManyRequestsError = new TooManyRequestsError(retryAfterInMs);
    }
});
