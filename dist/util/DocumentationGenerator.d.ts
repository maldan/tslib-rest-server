import { ConfigParams } from '../core/WS_Decorator';
export declare type Type_DocumentStruct = {
    className: string;
    method: string;
    functionName: string;
    isRequiresAuthorization: boolean;
    isReturnAccessToken: boolean;
    useJsonWrapper: boolean;
    description: string;
    examples: ConfigParams['examples'];
    isNotEmpty: ConfigParams['isNotEmpty'];
    isPositive: ConfigParams['isPositive'];
    isInteger: ConfigParams['isInteger'];
    isNumber: ConfigParams['isNumber'];
    isMatch: ConfigParams['isMatch'];
    isValid: ConfigParams['isValid'];
    struct: ConfigParams['struct'];
};
export declare class DocumentationGenerator {
    private static _sas;
    static add(params: Type_DocumentStruct): void;
    static generate(): void;
}
