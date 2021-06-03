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
exports.WebServer = void 0;
const Http = __importStar(require("http"));
const Fs = __importStar(require("fs"));
const Multipart = __importStar(require("parse-multipart-data"));
const WS_Router_1 = require("./core/WS_Router");
const WS_Context_1 = require("./core/WS_Context");
const WS_Error_1 = require("./error/WS_Error");
const DocumentationGenerator_1 = require("./util/DocumentationGenerator");
const CacheMan_1 = require("./util/CacheMan");
const DebugApi_1 = require("./debug/DebugApi");
class WebServer {
    constructor(routers = []) {
        this._wr = [];
        this._server = null;
        for (let i = 0; i < routers.length; i++) {
            this.registerRouter(routers[i]);
        }
        // Init docs and generate
        Fs.mkdirSync(WebServer.docsRoot, { recursive: true });
        if (WebServer.isGenerateDocumentation) {
            DocumentationGenerator_1.DocumentationGenerator.generate();
        }
        this.registerRouter(new WS_Router_1.WS_Router('--debug', [DebugApi_1.DebugApi]));
        WebServer.cache.init();
    }
    registerRouter(wr) {
        this._wr.push(wr);
    }
    createRouter(prefix = '', classes = [], folders = []) {
        return new WS_Router_1.WS_Router(prefix, classes, folders);
    }
    parseQueryParams(url) {
        let queryParams = url.split('?');
        if (queryParams.length > 1) {
            queryParams = queryParams.slice(1).join('?').split('&');
            const out = {};
            queryParams.map((x) => {
                const c = x.split('=');
                out[c[0]] = decodeURI(c[1]);
                /*if (out[c[0]].match(/^\d+$/g)) {
                  out[c[0]] = parseFloat(out[c[0]]);
                }
                if (out[c[0]] === 'true') {
                  out[c[0]] = true;
                }
                if (out[c[0]] === 'false') {
                  out[c[0]] = false;
                }*/
                return null;
            });
            return out;
        }
        return {};
    }
    /*public parseErrorMessage(ctx: WS_Context, msg: string): any {
          const m = msg.match(/^\[(.*?)] /);
          if (m) {
              msg = msg.replace(/^\[.*?] /, '');
  
              if (m[1]) {
                  const tuple = m[1].split(':');
                  let code: any = tuple[0];
                  code = code.replace("error", "500");
                  code = Number(code);
  
                  ctx.status = code;
  
                  const format = tuple[1] || 'string';
                  if (format === 'json') return JSON.parse(msg);
                  return msg;
              }
          }
          return msg;
      }*/
    listen(port) {
        const requestListener = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.url) {
                return;
            }
            const url = req.url || '';
            const ctx = new WS_Context_1.WS_Context(req, res);
            // Disable cors by default
            ctx.headers['access-control-allow-origin'] = '*';
            ctx.headers['access-control-allow-methods'] = '*';
            ctx.headers['access-control-allow-headers'] = '*';
            if (ctx.method === 'OPTIONS') {
                res.writeHead(200, ctx.headers);
                res.end();
                return;
            }
            const sendError = (status, e, message = '') => {
                if (!e) {
                    ctx.contentType = 'application/json';
                    ctx.status = status;
                    res.writeHead(ctx.status, ctx.headers);
                    res.end(JSON.stringify({
                        status: false,
                        description: message || 'Uknown error',
                    }));
                    return;
                }
                if (e instanceof WS_Error_1.WS_Error) {
                    ctx.contentType = 'application/json';
                    ctx.status = e.code;
                    res.writeHead(ctx.status, ctx.headers);
                    res.end(JSON.stringify({
                        status: false,
                        type: e.type,
                        value: e.value,
                        description: e.description || 'Uknown error',
                    }));
                }
                else {
                    ctx.contentType = 'application/json';
                    ctx.status = status;
                    res.writeHead(ctx.status, ctx.headers);
                    res.end(JSON.stringify({
                        status: false,
                        description: e.message || 'Uknown error',
                        stack: e.stack,
                    }));
                }
            };
            const sas = (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let args = this.parseQueryParams(url);
                if (req.headers['content-type']) {
                    // JSON
                    if (req.headers['content-type'].match('application/json')) {
                        try {
                            args = Object.assign(Object.assign({}, JSON.parse(data.toString('utf-8'))), args);
                        }
                        catch (e) {
                            return sendError(500, e);
                        }
                    }
                    // Multipart form
                    if (req.headers['content-type'] &&
                        req.headers['content-type'].match(/^multipart\/form-data;/)) {
                        const boundary = ((_a = req.headers['content-type'].split('; ').pop()) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                        if (boundary) {
                            const parts = Multipart.parse(data, boundary.split('=').pop() || '');
                            const formArgs = {};
                            for (let i = 0; i < parts.length; i++) {
                                if (parts[i].filename) {
                                    formArgs['files'] = formArgs['files'] || [];
                                    formArgs['files'].push({
                                        name: parts[i].filename,
                                        type: parts[i].type,
                                        data: parts[i].data,
                                        size: parts[i].data.length,
                                    });
                                }
                                else if (parts[i].name) {
                                    formArgs[parts[i].name] = parts[i].data.toString('utf-8');
                                }
                            }
                            args = Object.assign(Object.assign({}, formArgs), args);
                        }
                        else {
                            return sendError(500, undefined, 'Boundary not found');
                        }
                    }
                }
                try {
                    let isFound = false;
                    for (let i = 0; i < this._wr.length; i++) {
                        const wr = this._wr[i];
                        if (yield wr.match(url.split('?')[0])) {
                            const r = yield wr.resolve(ctx, url.split('?')[0], args);
                            if (r instanceof Fs.ReadStream) {
                                res.writeHead(ctx.status, ctx.headers);
                                r.on('open', () => {
                                    r.pipe(res);
                                });
                            }
                            else if (r instanceof Uint8Array) {
                                res.writeHead(ctx.status, ctx.headers);
                                res.end(Buffer.from(r));
                            }
                            else if (r instanceof Buffer) {
                                res.writeHead(ctx.status, ctx.headers);
                                res.end(r);
                            }
                            else if (typeof r === 'string' || typeof r === 'number') {
                                res.writeHead(ctx.status, ctx.headers);
                                if (ctx.useJsonWrapper) {
                                    res.end(JSON.stringify({
                                        status: true,
                                        response: r,
                                    }));
                                }
                                else {
                                    res.end(r + '');
                                }
                            }
                            else {
                                ctx.contentType = 'application/json';
                                res.writeHead(ctx.status, ctx.headers);
                                if (ctx.useJsonWrapper) {
                                    res.end(JSON.stringify({
                                        status: true,
                                        response: r,
                                    }));
                                }
                                else {
                                    res.end(JSON.stringify(r));
                                }
                            }
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        sendError(404, undefined, 'Path not found');
                    }
                }
                catch (e) {
                    sendError(500, e);
                }
            });
            if (ctx.contentLength > 0) {
                let chunk = Buffer.alloc(0);
                req.on('data', (d) => __awaiter(this, void 0, void 0, function* () {
                    chunk = Buffer.concat([chunk, d]);
                }));
                req.on('end', () => {
                    sas(chunk);
                });
            }
            else {
                sas(Buffer.from('{}'));
            }
        });
        this._server = Http.createServer(requestListener);
        this._server.listen(port);
    }
    destroy() {
        var _a;
        (_a = this._server) === null || _a === void 0 ? void 0 : _a.close();
        WebServer.cache.destroy();
    }
}
exports.WebServer = WebServer;
WebServer.docsRoot = './docs';
WebServer.docsDescription = '';
WebServer.cache = new CacheMan_1.CacheMan();
WebServer.adminPassword = '';
WebServer.isGenerateDocumentation = false;
