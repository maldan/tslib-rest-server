import { WS_Error } from '../error/WS_Error';
export declare type ConfigParams = {
    useJsonWrapper?: boolean;
    isRequiresAuthorization?: boolean;
    isReturnAccessToken?: boolean;
    isNotEmpty?: string[];
    isInteger?: string[];
    isNumber?: string[];
    isPositive?: string[];
    isMatch?: {
        [x: string]: (string | number)[];
    };
    isValid?: {
        [x: string]: string;
    };
    description?: string;
    examples?: {
        request: Record<string, unknown>;
        response: string | null | number | boolean | Record<string, unknown> | WS_Error;
    }[];
    struct?: Record<string, string>;
};
export declare function Config({ useJsonWrapper, isRequiresAuthorization, isReturnAccessToken, isNotEmpty, isPositive, isInteger, isNumber, isMatch, isValid, description, examples, struct, }: ConfigParams): (target: {
    path: string;
}, propertyKey: string, descriptor: PropertyDescriptor) => void;
