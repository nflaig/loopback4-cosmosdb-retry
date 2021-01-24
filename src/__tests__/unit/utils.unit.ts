import { expect } from "@loopback/testlab";
import { getEnvNumber, getEnvBoolean, pluralize } from "../../utils";

describe("Utils (unit)", () => {
    describe("pluralize()", () => {
        const noun = "test";

        it("should pluralize the given noun and display the count", () => {
            const count = 2;

            const pluralized = pluralize(noun, count);

            expect(pluralized).to.equal(`${count} ${noun}s`);
        });

        it("should not pluralize the given noun if the count is one", () => {
            const count = 1;

            const pluralized = pluralize(noun, count);

            expect(pluralized).to.equal(`${count} ${noun}`);
        });

        it("should not display the count if the prefixNumber is set to false", () => {
            const count = 1;

            const pluralized = pluralize(noun, count, false);

            expect(pluralized).to.equal(noun);
        });

        it("should append a different suffix if specified", () => {
            const count = 2;

            const differentSuffix = "differentSuffix";
            const pluralized = pluralize(noun, count, false, differentSuffix);

            expect(pluralized).to.equal(noun + differentSuffix);
        });
    });

    describe("getEnvNumber()", () => {
        const key = "TEST_NUMBER";
        const defaultValue = 123;
        const fallbackValue = 456;

        beforeEach(() => {
            setEnvNumber(defaultValue);
        });

        it("should return the environment variable as a number", () => {
            const testNumber = getEnvNumber(key, fallbackValue);

            expect(testNumber).to.equal(defaultValue);
        });

        it("should return the fallback value if the environment variable is not set", () => {
            unsetEnvNumber();

            const testNumber = getEnvNumber(key, fallbackValue);

            expect(testNumber).to.equal(fallbackValue);
        });

        it("should return the fallback value if the environment variable is not a number", () => {
            setEnvNumber(<number>(<unknown>"abc"));

            const testNumber = getEnvNumber(key, fallbackValue);

            expect(testNumber).to.equal(fallbackValue);
        });

        function setEnvNumber(value: number) {
            process.env[key] = value.toString();
        }

        function unsetEnvNumber() {
            delete process.env[key];
        }
    });

    describe("getEnvBoolean()", () => {
        const key = "TEST_BOOLEAN";
        const defaultValue = true;
        const fallbackValue = false;

        beforeEach(() => {
            setEnvBoolean(defaultValue);
        });

        it("should return the environment variable as a boolean", () => {
            const testBoolean = getEnvBoolean(key, fallbackValue);

            expect(testBoolean).to.equal(defaultValue);
        });

        it("should return the fallback value if the environment variable is not set", () => {
            unsetEnvBoolean();

            const testBoolean = getEnvBoolean(key, fallbackValue);

            expect(testBoolean).to.equal(fallbackValue);
        });

        it("should return the fallback value if the environment variable is not a boolean", () => {
            setEnvBoolean(<boolean>(<unknown>"abc"));

            const testBoolean = getEnvBoolean(key, fallbackValue);

            expect(testBoolean).to.equal(fallbackValue);
        });

        function setEnvBoolean(value: boolean) {
            process.env[key] = value.toString();
        }

        function unsetEnvBoolean() {
            delete process.env[key];
        }
    });
});
