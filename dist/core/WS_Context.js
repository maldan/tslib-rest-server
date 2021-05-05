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
exports.WS_Context = void 0;
const FileHandler_1 = require("../file/FileHandler");
class WS_Context {
    constructor(req, res) {
        this.status = 200;
        this.headers = {
            'content-type': 'text/plain',
        };
        // If true, then "test" -> { status: true, response: "test" }
        this.useJsonWrapper = false;
        this._req = req;
        this._res = res;
        this._fileHandler = new FileHandler_1.FileHandler();
    }
    handleFile(path, args = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._fileHandler.handle(this, path, args);
        });
    }
    set contentType(type) {
        this.headers['content-type'] = type;
    }
    set acceptRanges(val) {
        this.headers['accept-ranges'] = val;
    }
    set contentRange(val) {
        this.headers['content-range'] = val;
    }
    get method() {
        return this._req.method;
    }
    get authorization() {
        return this._req.headers['authorization'] || '';
    }
    get contentLength() {
        return Number(this._req.headers['content-length']) || 0;
    }
    get range() {
        if (!this._req.headers['range']) {
            return null;
        }
        return (this._req.headers['range'].replace('bytes=', '').split('-').filter(Boolean).map(Number) ||
            null);
    }
}
exports.WS_Context = WS_Context;
