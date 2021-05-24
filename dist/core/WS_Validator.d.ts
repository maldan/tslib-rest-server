export declare class WS_Validator {
    static isNotEmpty(args: {
        [x: string]: any;
    }): void;
    static isString(args: {
        [x: string]: any;
    }): void;
    static isNumber(args: {
        [x: string]: any;
    }): void;
    static isBoolean(args: {
        [x: string]: any;
    }): void;
    static isValid(kv: {
        [x: string]: any;
    }, type: string): void;
    static isMatch(kv: {
        [x: string]: any;
    }, values: (string | number)[]): void;
}
