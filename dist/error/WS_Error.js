"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_Error = void 0;
class WS_Error extends Error {
    constructor(type, value, description, code = 500) {
        super(description);
        this.type = type;
        this.value = value;
        this.description = description;
        this.code = code;
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
