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
exports.Image_Handler = void 0;
const Path = __importStar(require("path"));
const mime_1 = __importDefault(require("mime"));
const sharp_1 = __importDefault(require("sharp"));
const Fs = __importStar(require("fs-extra"));
const WebServer_1 = require("../WebServer");
class Image_Handler {
    match(path) {
        const extension = Path.extname(path);
        return ['.jpg', '.png', '.jpeg', '.gif'].includes(extension);
    }
    handle(ctx, path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const extension = Path.extname(path);
            const method = args['method'] || '';
            const quality = Number.parseInt(args['quality']) || undefined;
            const rotation = Number.parseInt(args['rotation']) || undefined;
            let width = Number.parseInt(args['width']) || undefined;
            const thumbnail = args['thumbnail']
                ? args['thumbnail'].split('x').map(Number)
                : [undefined, undefined];
            const cachePath = path + JSON.stringify(args);
            ctx.contentType = mime_1.default.getType(extension) || 'application/octet-stream';
            if (args['quality'] ||
                args['thumbnail'] ||
                args['rotation'] ||
                args['width'] ||
                args['method']) {
                return yield WebServer_1.WebServer.cache.smart(cachePath, () => __awaiter(this, void 0, void 0, function* () {
                    ctx.contentType = 'image/jpeg';
                    let buffer = null;
                    if (width) {
                        if (width <= 1) {
                            width = 1;
                        }
                        if (width >= 1280) {
                            width = 1280;
                        }
                        buffer = yield sharp_1.default(path)
                            .jpeg({ quality: quality || 100 })
                            .rotate(rotation)
                            .resize(width)
                            .withMetadata()
                            .toBuffer();
                    }
                    else {
                        buffer = yield sharp_1.default(path)
                            .jpeg({ quality: quality || 100 })
                            .rotate(rotation)
                            .resize(thumbnail[0], thumbnail[1])
                            .withMetadata()
                            .toBuffer();
                    }
                    if (method === 'getSize') {
                        ctx.contentType = 'application/json';
                        return Buffer.from(JSON.stringify({
                            size: buffer.length,
                        }), 'utf-8');
                    }
                    return buffer;
                }), 60);
            }
            return yield Fs.readFile(path);
        });
    }
}
exports.Image_Handler = Image_Handler;
