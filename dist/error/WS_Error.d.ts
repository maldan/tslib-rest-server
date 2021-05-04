export declare class WS_Error extends Error {
    code: number;
    type: string;
    value: string;
    description: string;
    constructor(type: string, value: string, description: string, code?: number);
    toJSON(): unknown;
}
export declare const ErrorType: {
    EMPTY_FIELD: string;
    TYPE_MISMATCH: string;
    VALUE_MISMATCH: string;
    OUT_OF_RANGE: string;
    INVALID: string;
    ACCESS_DENIED: string;
    NOT_FOUND: string;
    EXTERNAL_API: string;
};
