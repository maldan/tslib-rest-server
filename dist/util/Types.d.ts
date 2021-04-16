export declare type Type_HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
export declare type Type_MethodInfo = {
    httpMethod: Type_HttpMethod;
    function: () => void;
};
export declare type Type_HttpHeaders = {
    'content-length'?: string;
    'content-type'?: string;
    'accept-ranges'?: string;
    'content-range'?: string;
    'access-control-allow-origin'?: string;
    'access-control-allow-methods'?: string;
    'access-control-allow-headers'?: string;
    location?: string;
};
export declare type Type_WebServer = Record<string, unknown>;
