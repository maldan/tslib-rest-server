export declare class WS_DefaultClass {
    static isNotEmpty(args: {
        [x: string]: any;
    }): void;
    static isInteger(args: {
        [x: string]: any;
    }): void;
    static isNumber(args: {
        [x: string]: any;
    }): void;
    static inRange(args: {
        [x: string]: any;
    }, min: number, max: number): void;
    static isPositive(args: {
        [x: string]: any;
    }): void;
    static isValid(kv: {
        [x: string]: any;
    }, type: string): void;
    static isMatch(kv: {
        [x: string]: any;
    }, values: string[]): void;
}
