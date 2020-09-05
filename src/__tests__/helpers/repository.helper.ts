import { inject } from "@loopback/core";
import { DefaultCrudRepository, RepositoryBindings } from "@loopback/repository";
import { TestModel } from "../fixtures/models";
import { TestDataSource } from "./datasource.helper";

export class TestRepository extends DefaultCrudRepository<
    TestModel,
    typeof TestModel.prototype.id
> {
    constructor(@inject(`${RepositoryBindings.DATASOURCES}.test`) dataSource: TestDataSource) {
        super(TestModel, dataSource);
    }
}
