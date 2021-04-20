declare type ConfigParams = {
    useJsonWrapper?: boolean;
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
};
export declare function Config({ useJsonWrapper, isNotEmpty, isPositive, isInteger, isNumber, isMatch, isValid, }: ConfigParams): (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
export {};
