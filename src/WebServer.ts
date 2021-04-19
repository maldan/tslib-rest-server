import * as Http from 'http';
import * as Fs from 'fs';
import * as Multipart from 'parse-multipart-data';
import { IncomingMessage, ServerResponse } from 'http';
import { WS_Router } from './core/WS_Router';
import { WS_Context } from './core/WS_Context';
import { WS_Error } from './error/WS_Error';

export class WebServer {
  private _wr: WS_Router[] = [];

  constructor(routers: WS_Router[] = []) {
    for (let i = 0; i < routers.length; i++) {
      this.registerRouter(routers[i]);
    }
  }

  public registerRouter(wr: WS_Router): void {
    this._wr.push(wr);
  }

  public createRouter(prefix: string = '', classes: any[] = [], folders: string[] = []): WS_Router {
    return new WS_Router(prefix, classes, folders);
  }

  public parseQueryParams(url: string): any {
    let queryParams: any = url.split('?');
    if (queryParams.length > 1) {
      queryParams = queryParams.slice(1).join('?').split('&');
      const out: any = {};
      queryParams.map((x: any) => {
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

  public listen(port: number): void {
    const requestListener = async (req: IncomingMessage, res: ServerResponse) => {
      if (!req.url) {
        return;
      }
      const url = req.url || '';
      const ctx = new WS_Context(req, res);

      // Disable cors by default
      ctx.headers['access-control-allow-origin'] = '*';
      ctx.headers['access-control-allow-methods'] = '*';
      ctx.headers['access-control-allow-headers'] = '*';

      if (ctx.method === 'OPTIONS') {
        res.writeHead(200, ctx.headers);
        res.end();
        return;
      }

      const sendError = (status: number, e?: Error, message: string = '') => {
        if (!e) {
          ctx.contentType = 'application/json';
          ctx.status = status;
          res.writeHead(ctx.status, ctx.headers);
          res.end(
            JSON.stringify({
              status: false,
              description: message,
            }),
          );
          return;
        }
        if (e instanceof WS_Error) {
          ctx.contentType = 'application/json';
          ctx.status = e.code;
          res.writeHead(ctx.status, ctx.headers);
          res.end(
            JSON.stringify({
              status: false,
              type: e.type,
              value: e.value,
              description: e.description,
            }),
          );
        } else {
          ctx.contentType = 'application/json';
          ctx.status = status;
          res.writeHead(ctx.status, ctx.headers);
          res.end(
            JSON.stringify({
              status: false,
              description: e.message,
              stack: e.stack,
            }),
          );
        }
      };

      const sas = async (data: Buffer) => {
        let args = this.parseQueryParams(url);

        if (req.headers['content-type']) {
          // JSON
          if (req.headers['content-type'].match('application/json')) {
            try {
              args = {
                ...JSON.parse(data.toString('utf-8')),
                ...args,
              };
            } catch (e) {
              return sendError(500, e);
            }
          }

          // Multipart form
          if (
            req.headers['content-type'] &&
            req.headers['content-type'].match(/^multipart\/form-data;/)
          ) {
            const boundary = req.headers['content-type'].split('; ').pop()?.trim() || '';

            if (boundary) {
              const parts = Multipart.parse(data, boundary.split('=').pop() || '');
              const formArgs = {} as any;
              for (let i = 0; i < parts.length; i++) {
                if (parts[i].filename) {
                  formArgs['files'] = formArgs['files'] || [];
                  formArgs['files'].push({
                    name: parts[i].filename,
                    type: parts[i].type,
                    data: parts[i].data,
                    size: parts[i].data.length,
                  });
                } else if (parts[i].name) {
                  formArgs[parts[i].name as string] = parts[i].data.toString('utf-8');
                }
              }

              args = {
                ...formArgs,
                ...args,
              };
            } else {
              return sendError(500, undefined, 'Boundary not found');
            }
          }
        }

        try {
          let isFound = false;

          for (let i = 0; i < this._wr.length; i++) {
            const wr = this._wr[i];

            if (await wr.match(url.split('?')[0])) {
              const r = await wr.resolve(ctx, url.split('?')[0], args);

              if (r instanceof Fs.ReadStream) {
                res.writeHead(ctx.status, ctx.headers);
                r.on('open', () => {
                  r.pipe(res);
                });
              } else if (r instanceof Uint8Array) {
                res.writeHead(ctx.status, ctx.headers);
                res.end(Buffer.from(r));
              } else if (r instanceof Buffer) {
                res.writeHead(ctx.status, ctx.headers);
                res.end(r);
              } else if (typeof r === 'string' || typeof r === 'number') {
                res.writeHead(ctx.status, ctx.headers);
                if (ctx.useJsonWrapper) {
                  res.end(
                    JSON.stringify({
                      status: true,
                      response: r,
                    }),
                  );
                } else {
                  res.end(r + '');
                }
              } else {
                ctx.contentType = 'application/json';
                res.writeHead(ctx.status, ctx.headers);
                if (ctx.useJsonWrapper) {
                  res.end(
                    JSON.stringify({
                      status: true,
                      response: r,
                    }),
                  );
                } else {
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
        } catch (e) {
          sendError(500, e);
        }
      };

      if (ctx.contentLength > 0) {
        let chunk: Buffer = Buffer.alloc(0);
        req.on('data', async (d) => {
          chunk = Buffer.concat([chunk, d]);
        });
        req.on('end', () => {
          sas(chunk);
        });
      } else {
        sas(Buffer.from('{}'));
      }
    };

    const server = Http.createServer(requestListener);
    server.listen(port);
  }
}
