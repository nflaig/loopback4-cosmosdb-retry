export function pluralize(noun: string, count: number, prefixNumber = true, suffix = "s") {
    return `${prefixNumber ? `${count} ` : ""}${noun}${count !== 1 ? suffix : ""}`;
}

export function getEnvNumber(key: string, fallback: number): number {
    const value = Number(process.env[key]);

    return Number.isNaN(value) ? fallback : value;
}

export function getEnvBoolean(key: string, fallback: boolean): boolean {
    const value = process.env[key] ?? fallback;

    return typeof value === "boolean" ? value : value === "true";
}
