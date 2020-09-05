import { inject } from "@loopback/core"; // eslint-disable-line no-unused-vars
import { juggler } from "@loopback/repository";
import { RetryMixin } from "../../mixins";

const config = {
    name: "test",
    connector: "memory"
};

export class TestDataSource extends juggler.DataSource {
    static dataSourceName = "test";
    static readonly defaultConfig = config;

    constructor(
        @inject("datasources.config.db", { optional: true })
        dsConfig: object = config
    ) {
        super(dsConfig);
    }
}

export class TestDataSourceWithRetry extends RetryMixin(TestDataSource) {}
