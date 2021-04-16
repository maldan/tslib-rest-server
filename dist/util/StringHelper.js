"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringHelper {
    static camelToKebab(s) {
        if (!s) {
            return s;
        }
        const x = s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
        if (x[0] === '-') {
            return x.slice(1);
        }
        return x;
    }
}
exports.default = StringHelper;
