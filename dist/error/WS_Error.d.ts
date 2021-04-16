export declare class WS_Error extends Error {
    code: number;
    type: string;
    value: string;
    description: string;
    constructor(type: string, value: string, description: string, code?: number);
    toJSON(): {
        type: string;
        value: string;
        description: string;
    };
}
