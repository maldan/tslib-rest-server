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
exports.Video_Handler = void 0;
const Path = __importStar(require("path"));
const Util = __importStar(require("util"));
const Fs = __importStar(require("fs"));
const Mime = __importStar(require("mime"));
const Stat = Util.promisify(Fs.stat);
class Video_Handler {
    constructor() {
        this._cache = {};
    }
    match(path) {
        const extension = Path.extname(path);
        return ['.mp4'].includes(extension);
    }
    handle(ctx, path, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const extension = Path.extname(path);
            const thumbnail = args['thumbnail'];
            const cachePath = path + JSON.stringify(args);
            /*if (this._cache[cachePath]) {
              ctx.contentType = 'image/jpeg';
              return this._cache[cachePath];
            }*/
            ctx.contentType = Mime.getType(extension) || 'text/plain';
            ctx.status = 206;
            ctx.acceptRanges = 'bytes';
            if (ctx.range) {
                const fileInfo = yield Stat(path);
                const start = ctx.range[0];
                const end = (_a = ctx.range[1]) !== null && _a !== void 0 ? _a : fileInfo.size - 1;
                ctx.contentRange = `bytes ${start}-${end}/${fileInfo.size}`;
                return Fs.createReadStream(path, { start, end });
            }
            else {
                const fileInfo = yield Stat(path);
                ctx.contentRange = `${0}-${fileInfo.size - 1}/${fileInfo.size}`;
                return Buffer.from([]);
            }
        });
    }
}
exports.Video_Handler = Video_Handler;
