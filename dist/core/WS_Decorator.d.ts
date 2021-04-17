declare type ConfigParams = {
    useJsonWrapper?: boolean;
    isNotEmpty?: string[];
    isInteger?: string[];
    isNumber?: string[];
    isPositive?: string[];
};
export declare function Config({ useJsonWrapper, isNotEmpty, isPositive, isInteger, isNumber, }: ConfigParams): (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
export {};
