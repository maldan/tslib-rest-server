declare class CacheItem {
    value: unknown;
    duration: number;
    constructor(value: unknown, duration: number);
}
export declare class CacheMan {
    _cache: Record<string, CacheItem>;
    _intervalId: any;
    constructor();
    init(): void;
    destroy(): void;
    smart<T>(key: string, value: () => Promise<T>, time?: number): Promise<T>;
    put(key: string, value: unknown, time?: number): void;
    get<T>(key: string, defaultValue?: unknown): T;
    get stat(): {
        size: number;
        amount: number;
    };
}
export {};
