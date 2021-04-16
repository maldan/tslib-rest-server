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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = void 0;
const Image_Handler_1 = require("./Image_Handler");
const Path = __importStar(require("path"));
const Mime = __importStar(require("mime"));
const Util = __importStar(require("util"));
const Fs = __importStar(require("fs"));
const Video_Handler_1 = require("./Video_Handler");
const ReadFile = Util.promisify(Fs.readFile);
class FileHandler {
    constructor() {
        this._handlers = [new Image_Handler_1.Image_Handler(), new Video_Handler_1.Video_Handler()];
    }
    handle(ctx, path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            /*if (path[path.length - 1] === '/') {
                    path += 'index.html';
                }*/
            // Check handlers
            for (let i = 0; i < this._handlers.length; i++) {
                if (this._handlers[i].match(path)) {
                    return yield this._handlers[i].handle(ctx, path, args);
                }
            }
            // console.log(path);
            // Default return
            const extension = Path.extname(path);
            ctx.contentType = Mime.getType(extension) || 'text/plain';
            return yield ReadFile(path);
        });
    }
}
exports.FileHandler = FileHandler;
