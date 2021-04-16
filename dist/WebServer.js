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
const WS_Router_1 = require("./core/WS_Router");
const WS_Context_1 = require("./core/WS_Context");
const WS_Error_1 = require("./error/WS_Error");
class WebServer {
    constructor(routers = []) {
        this._wr = [];
        for (let i = 0; i < routers.length; i++) {
            this.registerRouter(routers[i]);
        }
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
                if (out[c[0]].match(/^\d+$/g)) {
                    out[c[0]] = parseFloat(out[c[0]]);
                }
                if (out[c[0]] === 'true') {
                    out[c[0]] = true;
                }
                if (out[c[0]] === 'false') {
                    out[c[0]] = false;
                }
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
            const sas = (data) => __awaiter(this, void 0, void 0, function* () {
                let args = this.parseQueryParams(url);
                if (req.headers['content-type'] && req.headers['content-type'].match('application/json')) {
                    args = Object.assign(Object.assign({}, JSON.parse(data.toString())), args);
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
                        res.writeHead(404, ctx.headers);
                        res.end(JSON.stringify({
                            status: false,
                            description: 'Path not found',
                        }));
                    }
                }
                catch (e) {
                    if (e instanceof WS_Error_1.WS_Error) {
                        ctx.contentType = 'application/json';
                        ctx.status = e.code;
                        res.writeHead(ctx.status, ctx.headers);
                        res.end(JSON.stringify({
                            status: false,
                            type: e.type,
                            value: e.value,
                            description: e.description,
                        }));
                    }
                    else {
                        ctx.contentType = 'application/json';
                        ctx.status = 500;
                        res.writeHead(ctx.status, ctx.headers);
                        res.end(JSON.stringify({
                            status: false,
                            description: e.message,
                            stack: e.stack,
                        }));
                        console.error(e);
                    }
                }
            });
            if (ctx.contentLength > 0) {
                req.on('data', (d) => __awaiter(this, void 0, void 0, function* () {
                    sas(d);
                }));
            }
            else {
                sas('{}');
            }
        });
        const server = Http.createServer(requestListener);
        server.listen(port);
    }
}
exports.WebServer = WebServer;
