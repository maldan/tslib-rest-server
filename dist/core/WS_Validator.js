"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_Validator = void 0;
const WS_Error_1 = require("../error/WS_Error");
class WS_Validator {
    static isNotEmpty(args) {
        for (const key in args) {
            const arg = args[key];
            if (arg === undefined || arg === null || arg === '') {
                throw new WS_Error_1.WS_Error('emptyField', key, `Field "${key}" is required!`);
            }
        }
    }
    static isInteger(args) {
        for (const key in args) {
            const arg = args[key];
            if (arg.toString().match(/^\d+$/) === false) {
                throw new WS_Error_1.WS_Error('typeMismatch', key, `Field "${key}" is not integer!`);
            }
        }
    }
    static isNumber(args) {
        for (const key in args) {
            const arg = args[key];
            if (Number.isNaN(Number.parseFloat(arg))) {
                throw new WS_Error_1.WS_Error('typeMismatch', key, `Field "${key}" is not a number!`);
            }
        }
    }
    static inRange(args, min, max) {
        this.isNumber(args);
        for (const key in args) {
            const arg = args[key];
            if (!(arg >= min && arg <= max)) {
                throw new WS_Error_1.WS_Error('outOfRange', key, `Field "${key}" must be >= ${min} and <= ${max}!`);
            }
        }
    }
    static isPositive(args) {
        this.isNumber(args);
        for (const key in args) {
            const arg = args[key];
            if (!(arg >= 0)) {
                throw new WS_Error_1.WS_Error('outOfRange', key, `Field "${key}" must be greater then 0!`);
            }
        }
    }
    static isValid(kv, type) {
        if (type === 'email') {
            for (const key in kv) {
                const arg = kv[key];
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!re.test(arg.toLowerCase())) {
                    throw new WS_Error_1.WS_Error('invalid', key, `Field "${key}" must contain a valid email!`);
                }
            }
        }
        if (type === 'date') {
            for (const key in kv) {
                const arg = kv[key];
                if (arg instanceof Date) {
                    continue;
                }
                if (new Date(arg).toString() === 'Invalid Date') {
                    throw new WS_Error_1.WS_Error('invalid', key, `Field "${key}" must contain a valid (YYYY-MM-DD) date!`);
                }
            }
        }
    }
    static isMatch(kv, values) {
        for (const key in kv) {
            const arg = kv[key];
            if (!values.includes(arg)) {
                throw new WS_Error_1.WS_Error('valueMismatch', key, `Field "${key}" must be equal one of this values ${values}!`);
            }
        }
    }
}
exports.WS_Validator = WS_Validator;
