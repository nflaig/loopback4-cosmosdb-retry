import { Entity, model, property } from "@loopback/repository";

@model()
export class TestModel extends Entity {
    @property({
        type: "string",
        id: true,
        generated: false,
        defaultFn: "uuidv4"
    })
    id: string;

    @property({
        type: "string",
        default: "test"
    })
    stringProp: string;

    @property({
        type: "number",
        default: "123"
    })
    numProp: number;

    @property({
        type: "boolean",
        default: true
    })
    boolProp: boolean;

    constructor(data?: Partial<TestModel>) {
        super(data);
    }
}
