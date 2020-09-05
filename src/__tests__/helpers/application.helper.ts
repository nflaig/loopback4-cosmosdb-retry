import { Application, ApplicationConfig } from "@loopback/core";
import { RepositoryMixin } from "@loopback/repository";
import { TestRepository } from "./repository.helper";
import { TestDataSource, TestDataSourceWithRetry } from "./datasource.helper";

interface TestApplicationConfig extends ApplicationConfig {
    withRetry?: boolean;
}

export class TestApplication extends RepositoryMixin(Application) {
    constructor(options: TestApplicationConfig = {}) {
        super(options);

        this.dataSource(options.withRetry ? TestDataSourceWithRetry : TestDataSource);

        this.repository(TestRepository);
    }
}

export function getApplication(options: TestApplicationConfig = {}): TestApplication {
    return new TestApplication(options);
}
