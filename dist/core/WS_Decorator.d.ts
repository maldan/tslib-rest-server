declare type ConfigParams = {
    useJsonWrapper?: boolean;
    isNotEmpty?: string[];
    isInteger?: string[];
    isNumber?: string[];
    isPositive?: string[];
    isMatch?: {
        [x: string]: (string | number)[];
    };
};
export declare function Config({ useJsonWrapper, isNotEmpty, isPositive, isInteger, isNumber, isMatch, }: ConfigParams): (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
export {};
