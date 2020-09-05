export interface ErrorResponse extends Error {
    code: number;
    codeName?: string;
    ok: number;
    index: number;
    driver: boolean;
}

export type Constructor<T> = new (...args: any[]) => T;

export type MixinTarget<T extends object> = Constructor<{ [P in keyof T]: T[P] }>;
