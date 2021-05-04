"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorType = exports.WS_Error = void 0;
class WS_Error extends Error {
    constructor(type, value, description, code = 500) {
        super(description);
        this.type = type || '';
        this.value = value || '';
        this.description = description || '';
        this.code = code || 500;
    }
    toJSON() {
        return {
            type: this.type,
            value: this.value,
            description: this.description,
        };
    }
}
exports.WS_Error = WS_Error;
exports.ErrorType = {
    EMPTY_FIELD: 'emptyField',
    TYPE_MISMATCH: 'typeMismatch',
    VALUE_MISMATCH: 'valueMismatch',
    OUT_OF_RANGE: 'outOfRange',
    INVALID: 'invalid',
    ACCESS_DENIED: 'accessDenied',
    NOT_FOUND: 'notFound',
    EXTERNAL_API: 'externalApi',
};
