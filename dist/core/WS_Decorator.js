"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const WS_Error_1 = require("../error/WS_Error");
const DocumentationGenerator_1 = require("../util/DocumentationGenerator");
const WS_Validator_1 = require("./WS_Validator");
const extractFields = (obj, fields) => {
    const out = {};
    for (let i = 0; i < fields.length; i++) {
        out[fields[i]] = obj[fields[i]];
    }
    return out;
};
function Config({ useJsonWrapper = false, isRequiresAuthorization = false, isReturnAccessToken = false, isNotEmpty = [], isPositive = [], isInteger = [], isNumber = [], isMatch = {}, isValid = {}, description = '', examples = [], struct = {}, contentType = undefined, }) {
    return function (target, propertyKey, descriptor) {
        // Generate documentation
        DocumentationGenerator_1.DocumentationGenerator.add({
            className: target.path,
            method: propertyKey.split('_')[0],
            functionName: propertyKey.split('_').pop() || '',
            isRequiresAuthorization,
            isReturnAccessToken,
            useJsonWrapper,
            description,
            examples,
            isNotEmpty,
            isPositive,
            isInteger,
            isNumber,
            isMatch,
            isValid,
            struct,
        });
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const requestArgs = args[0];
            // Use wrapper json
            if (requestArgs.ctx && useJsonWrapper) {
                requestArgs.ctx.useJsonWrapper = useJsonWrapper;
            }
            if (requestArgs.ctx && contentType) {
                requestArgs.ctx.contentType = contentType;
            }
            // Fill from struct
            for (const key in struct) {
                if (struct[key] === 'string') {
                    isNotEmpty.push(key);
                }
                if (struct[key] === 'number') {
                    isNumber.push(key);
                }
                if (struct[key] === 'email') {
                    isValid[key] = 'email';
                }
                if (struct[key] === 'date') {
                    isValid[key] = 'date';
                }
            }
            // Check auth
            if (isRequiresAuthorization && !requestArgs.accessToken) {
                throw new WS_Error_1.WS_Error(WS_Error_1.ErrorType.ACCESS_DENIED, 'accessToken', 'Method requires Authorization header');
            }
            // Check empty fields
            WS_Validator_1.WS_Validator.isNotEmpty(extractFields(requestArgs, isNotEmpty));
            WS_Validator_1.WS_Validator.isPositive(extractFields(requestArgs, isPositive));
            WS_Validator_1.WS_Validator.isInteger(extractFields(requestArgs, isInteger));
            WS_Validator_1.WS_Validator.isNumber(extractFields(requestArgs, isNumber));
            // Check matching
            for (const key in isMatch) {
                WS_Validator_1.WS_Validator.isMatch({ [key]: requestArgs[key] }, isMatch[key]);
            }
            // Check valid
            for (const key in isValid) {
                WS_Validator_1.WS_Validator.isValid({ [key]: requestArgs[key] }, isValid[key]);
            }
            // Convert number to number
            for (const key of isPositive) {
                requestArgs[key] = Number.parseFloat(requestArgs[key]);
            }
            for (const key of isNumber) {
                requestArgs[key] = Number.parseFloat(requestArgs[key]);
            }
            for (const key of isInteger) {
                requestArgs[key] = Number.parseInt(requestArgs[key]);
            }
            // console.log('wrapped function: before invoking ' + propertyKey);
            const result = originalMethod.apply(this, args);
            // console.log('wrapped function: after invoking ' + propertyKey);
            return result;
        };
    };
}
exports.Config = Config;
