import { WS_Error } from '../error/WS_Error';
export declare type ConfigParams = {
    useJsonWrapper?: boolean;
    isRequiresAuthorization?: boolean;
    isReturnAccessToken?: boolean;
    description?: string;
    examples?: {
        request: Record<string, unknown>;
        response: string | null | number | boolean | Record<string, unknown> | WS_Error;
    }[];
    struct?: Record<string, string>;
    contentType?: string;
};
export declare function Config({ useJsonWrapper, isRequiresAuthorization, isReturnAccessToken, description, examples, struct, contentType, }: ConfigParams): (target: {
    path: string;
}, propertyKey: string, descriptor: PropertyDescriptor) => void;
