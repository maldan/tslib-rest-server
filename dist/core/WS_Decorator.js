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
const ALLOWED_TYPES = ['number', 'integer', 'string', 'email', 'date', 'boolean', 'file'];
function Config({ useJsonWrapper = false, isRequiresAuthorization = false, isReturnAccessToken = false, description = '', examples = [], struct = {}, contentType = undefined, }) {
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
            struct,
        });
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const requestArgs = args[0];
            const isNotEmpty = [];
            const isPositive = [];
            const isInteger = [];
            const isNumber = [];
            const isBoolean = [];
            const isString = [];
            const isMatch = {};
            const isValid = {};
            // Use wrapper json
            if (requestArgs.ctx && useJsonWrapper) {
                requestArgs.ctx.useJsonWrapper = useJsonWrapper;
            }
            if (requestArgs.ctx && contentType) {
                requestArgs.ctx.contentType = contentType;
            }
            // Fill from struct
            for (const key in struct) {
                let currentKey = struct[key];
                // Check if optional
                let isOptional = false;
                if (currentKey.slice(-1) === '?') {
                    isOptional = true;
                    currentKey = currentKey.slice(0, -1);
                }
                // Check if array
                let isArray = false;
                if (currentKey.slice(-2) === '[]') {
                    isArray = true;
                    currentKey = currentKey.slice(0, -2);
                    if (Array.isArray(requestArgs[key])) {
                        // ok
                    }
                    else {
                        try {
                            requestArgs[key] = JSON.parse(requestArgs[key]);
                        }
                        catch (_a) {
                            throw new WS_Error_1.WS_Error(WS_Error_1.ErrorType.INVALID, key, `Field must be an array. Example [1, 2, 3] or ["a", "b", "c"]`);
                        }
                        if (!Array.isArray(requestArgs[key])) {
                            throw new WS_Error_1.WS_Error(WS_Error_1.ErrorType.INVALID, key, `Field must be an array. Example [1, 2, 3] or ["a", "b", "c"]`);
                        }
                    }
                }
                // Check types
                if (!ALLOWED_TYPES.includes(currentKey)) {
                    throw new WS_Error_1.WS_Error(WS_Error_1.ErrorType.INVALID, key, `Unsupported type "${currentKey}"`);
                }
                // Check string
                if (currentKey === 'string') {
                    if (isOptional) {
                        if (!requestArgs[key]) {
                            requestArgs[key] = '';
                        }
                    }
                    else {
                        isNotEmpty.push(key);
                        isString.push(key);
                    }
                }
                // Check boolean
                if (currentKey === 'boolean') {
                    if (isOptional) {
                        if (requestArgs[key] !== null && requestArgs[key] !== undefined) {
                            requestArgs[key] = requestArgs[key] || 'false';
                            isBoolean.push(key);
                        }
                        else {
                            requestArgs[key] = 'false';
                        }
                    }
                    else {
                        isBoolean.push(key);
                        isNotEmpty.push(key);
                    }
                }
                // Check number
                if (currentKey === 'number') {
                    if (isOptional) {
                        if (requestArgs[key] !== null && requestArgs[key] !== undefined) {
                            requestArgs[key] = requestArgs[key] || '0';
                            isNumber.push(key);
                        }
                        else {
                            requestArgs[key] = '0';
                        }
                    }
                    else {
                        // requestArgs[key] = Number(requestArgs[key]);
                        // if (Number.isNaN(requestArgs[key])) {
                        //  requestArgs[key] = null;
                        // }
                        isNotEmpty.push(key);
                        isNumber.push(key);
                    }
                }
                // Check email
                if (currentKey === 'email') {
                    if (isOptional) {
                        if (requestArgs[key]) {
                            isValid[key] = 'email';
                        }
                        else {
                            requestArgs[key] = '';
                        }
                    }
                    else {
                        isValid[key] = 'email';
                    }
                }
                // Check date
                if (currentKey === 'date') {
                    if (isOptional) {
                        if (requestArgs[key]) {
                            // requestArgs[key] = new Date(requestArgs[key] as string);
                            isValid[key] = 'date';
                        }
                        else {
                            requestArgs[key] = null;
                        }
                    }
                    else {
                        // requestArgs[key] = new Date(requestArgs[key] as string);
                        isValid[key] = 'date';
                    }
                }
                // String params
                /*if (struct[key] === 'string') {
                  isNotEmpty.push(key);
                }
                if (struct[key] === 'string?') {
                  if (requestArgs[key]) {
                    isNotEmpty.push(key);
                  } else {
                    requestArgs[key] = '';
                  }
                }
        
                // Number params
                if (struct[key] === 'number') {
                  requestArgs[key] = Number(requestArgs[key]);
                  isNumber.push(key);
                }
                if (struct[key] === 'number?') {
                  if (requestArgs[key] !== null && requestArgs[key] !== undefined) {
                    requestArgs[key] = Number(requestArgs[key]);
                    isNumber.push(key);
                  } else {
                    requestArgs[key] = 0;
                  }
                }
        
                // Emails
                if (struct[key] === 'email') {
                  isValid[key] = 'email';
                }
                if (struct[key] === 'email?') {
                  if (requestArgs[key]) {
                    isValid[key] = 'email';
                  } else {
                    requestArgs[key] = '';
                  }
                }
        
                // Date
                if (struct[key] === 'date') {
                  requestArgs[key] = new Date(requestArgs[key] as string);
                  isValid[key] = 'date';
                }
                if (struct[key] === 'date?') {
                  if (requestArgs[key]) {
                    requestArgs[key] = new Date(requestArgs[key] as string);
                    isValid[key] = 'date';
                  } else {
                    requestArgs[key] = null;
                  }
                }*/
            }
            // Check auth
            if (isRequiresAuthorization && !requestArgs.accessToken) {
                throw new WS_Error_1.WS_Error(WS_Error_1.ErrorType.ACCESS_DENIED, 'accessToken', 'Method requires Authorization header');
            }
            // Check empty fields
            WS_Validator_1.WS_Validator.isNotEmpty(extractFields(requestArgs, isNotEmpty));
            WS_Validator_1.WS_Validator.isNumber(extractFields(requestArgs, isNumber));
            WS_Validator_1.WS_Validator.isString(extractFields(requestArgs, isString));
            WS_Validator_1.WS_Validator.isBoolean(extractFields(requestArgs, isBoolean));
            // WS_Validator.isPositive(extractFields(requestArgs, isPositive));
            // WS_Validator.isInteger(extractFields(requestArgs, isInteger));
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
            // Boolean
            for (const key of isBoolean) {
                requestArgs[key] = requestArgs[key] === 'true' || requestArgs[key] === true ? true : false;
            }
            // Convert date to date
            for (const key in isValid) {
                if (isValid[key] === 'date') {
                    requestArgs[key] = new Date(requestArgs[key]);
                }
            }
            // console.log('wrapped function: before invoking ' + propertyKey);
            const result = originalMethod.apply(this, args);
            // console.log('wrapped function: after invoking ' + propertyKey);
            return result;
        };
    };
}
exports.Config = Config;
