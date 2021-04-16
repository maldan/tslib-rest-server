"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.WS_Router = void 0;
const Fs = __importStar(require("fs"));
const Util = __importStar(require("util"));
const FileHandler_1 = require("../file/FileHandler");
const StringHelper_1 = __importDefault(require("../util/StringHelper"));
const WS_Controller_1 = require("./WS_Controller");
const ReadFile = Util.promisify(Fs.readFile);
const Exists = Util.promisify(Fs.exists);
class WS_Router {
    constructor(prefix = '', classes = [], folders = []) {
        this.prefix = '';
        this._controllers = {};
        this._folders = [];
        this._fileHandler = new FileHandler_1.FileHandler();
        this.prefix = prefix;
        for (let i = 0; i < classes.length; i++) {
            this.registerClass(classes[i]);
        }
        for (let i = 0; i < folders.length; i++) {
            this.registerFolder(folders[i]);
        }
    }
    findInFolder(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (path.slice(-1) === '/') {
                path += 'index.html';
            }
            for (let i = 0; i < this._folders.length; i++) {
                if (yield Exists(this._folders[i] + path)) {
                    return this._folders[i] + path;
                }
            }
            return null;
        });
    }
    match(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (path.slice(-1) === '/') {
                path += 'index.html';
            }
            const t = path.split('/').filter(Boolean);
            if (this.prefix) {
                if (t[0] === this.prefix && (yield this.findInFolder('/' + t.slice(1).join('/')))) {
                    return true;
                }
                return !!(t[0] === this.prefix && this._controllers[t[1]]);
            }
            else {
                if (yield this.findInFolder(path)) {
                    return true;
                }
                return !!this._controllers[t[0]];
            }
        });
    }
    resolve(ctx, path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const t = path.split('/').filter(Boolean);
            const realPath = this.prefix ? '/' + t.slice(1).join('/') : path;
            const filePath = yield this.findInFolder(realPath);
            if (filePath) {
                return yield this._fileHandler.handle(ctx, filePath, args);
            }
            if (this.prefix) {
                if (!this._controllers[t[1]]) {
                    throw new Error(`[405] Controller not found!`);
                }
                return yield this._controllers[t[1]].execute(ctx, t[2] || 'index', args);
            }
            else {
                if (!this._controllers[t[0]]) {
                    throw new Error(`[405] Controller not found!`);
                }
                return yield this._controllers[t[0]].execute(ctx, t[1] || 'index', args);
            }
        });
    }
    registerClass(c) {
        var _a;
        const controllerName = (_a = c.path) !== null && _a !== void 0 ? _a : StringHelper_1.default.camelToKebab(c.name);
        this._controllers[controllerName] = new WS_Controller_1.WS_Controller(c);
    }
    registerFolder(path) {
        this._folders.push(path);
        console.log(this._folders);
    }
}
exports.WS_Router = WS_Router;
