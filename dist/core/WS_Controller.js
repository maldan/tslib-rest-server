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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_Controller = void 0;
const StringHelper_1 = __importDefault(require("../util/StringHelper"));
class WS_Controller {
    constructor(staticClass) {
        this._functionList = {};
        this._sc = staticClass;
        const methodList = Object.getOwnPropertyNames(this._sc);
        for (let i = 0; i < methodList.length; i++) {
            if (methodList[i].match(/^get_/)) {
                this._functionList[StringHelper_1.default.camelToKebab(methodList[i])] = {
                    httpMethod: 'GET',
                    function: this._sc[methodList[i]],
                };
            }
            if (methodList[i].match(/^post_/)) {
                this._functionList[StringHelper_1.default.camelToKebab(methodList[i])] = {
                    httpMethod: 'POST',
                    function: this._sc[methodList[i]],
                };
            }
            if (methodList[i].match(/^delete_/)) {
                this._functionList[StringHelper_1.default.camelToKebab(methodList[i])] = {
                    httpMethod: 'DELETE',
                    function: this._sc[methodList[i]],
                };
            }
        }
    }
    execute(ctx, fnName, args) {
        return __awaiter(this, void 0, void 0, function* () {
            fnName = StringHelper_1.default.camelToKebab(ctx.method.toLowerCase() + '_' + fnName);
            const fn = this._functionList[fnName];
            if (!fn) {
                throw new Error(`[405] Method not found!`);
            }
            if (fn.httpMethod !== ctx.method) {
                throw new Error(`[405] Method not allowed!`);
            }
            // this._sc['context'] = ctx;
            // this._functionList[fnName].function['sas'] = 1;
            const binded = this._functionList[fnName].function.bind(this._sc, Object.assign(Object.assign({}, args), { accessToken: ctx.authorization }));
            return yield binded();
            /*return await FunctionHelper.callFunctionWithArgumentNames(
              this._functionList[fnName].function,
              {
                ...args,
                ctx,
                authorization: ctx.authorization,
              },
              this._sc,
            );*/
        });
    }
}
exports.WS_Controller = WS_Controller;
