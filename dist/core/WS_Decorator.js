"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const WS_Validator_1 = require("./WS_Validator");
const extractFields = (obj, fields) => {
    const out = {};
    for (let i = 0; i < fields.length; i++) {
        out[fields[i]] = obj[fields[i]];
    }
    return out;
};
function Config({ useJsonWrapper = false, isNotEmpty = [], isPositive = [], isInteger = [], isNumber = [], }) {
    return function (_target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const requestArgs = args[0];
            // Use wrapper json
            if (requestArgs.ctx && useJsonWrapper) {
                requestArgs.ctx.useJsonWrapper = useJsonWrapper;
            }
            // Check empty fields
            WS_Validator_1.WS_Validator.isNotEmpty(extractFields(requestArgs, isNotEmpty));
            WS_Validator_1.WS_Validator.isPositive(extractFields(requestArgs, isPositive));
            WS_Validator_1.WS_Validator.isInteger(extractFields(requestArgs, isInteger));
            WS_Validator_1.WS_Validator.isNumber(extractFields(requestArgs, isNumber));
            console.log('wrapped function: before invoking ' + propertyKey);
            const result = originalMethod.apply(this, args);
            console.log('wrapped function: after invoking ' + propertyKey);
            return result;
        };
    };
}
exports.Config = Config;
