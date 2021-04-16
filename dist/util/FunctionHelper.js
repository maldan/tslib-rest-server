"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class FunctionHelper {
    static getFunctionParameterNames(fn) {
        const fnStr = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, '');
        const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
        if (result === null) {
            return [];
        }
        return result;
    }
    static callFunctionWithArgumentNames(fn, args = {}, context = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const argNames = FunctionHelper.getFunctionParameterNames(fn);
            const finalArray = [];
            for (const name in args) {
                if (!args.hasOwnProperty(name)) {
                    continue;
                }
                const index = argNames.indexOf(name);
                if (index === -1) {
                    continue;
                }
                finalArray[index] = args[name];
            }
            return yield fn.apply(context, finalArray);
        });
    }
}
exports.default = FunctionHelper;
