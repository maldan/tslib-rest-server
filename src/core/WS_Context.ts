import { IncomingMessage, ServerResponse } from 'http';
import { Type_HttpHeaders, Type_HttpMethod } from '../util/Types';
import { FileHandler } from '../file/FileHandler';
import { ReadStream } from 'fs';

export class WS_Context {
  private _req: IncomingMessage;
  private _res: ServerResponse;
  private _fileHandler: FileHandler;

  status: number = 200;
  headers: Type_HttpHeaders = {
    'content-type': 'text/plain',
  };

  // If true, then "test" -> { status: true, response: "test" }
  useJsonWrapper: boolean = false;

  constructor(req: IncomingMessage, res: ServerResponse) {
    this._req = req;
    this._res = res;
    this._fileHandler = new FileHandler();
  }

  async handleFile(
    path: string,
    args: { [key: string]: unknown } = {},
  ): Promise<Buffer | ReadStream> {
    return await this._fileHandler.handle(this, path, args);
  }

  public set contentType(type: string) {
    this.headers['content-type'] = type;
  }

  public set acceptRanges(val: string) {
    this.headers['accept-ranges'] = val;
  }

  public set contentRange(val: string) {
    this.headers['content-range'] = val;
  }

  public get method(): Type_HttpMethod {
    return (this._req.method as unknown) as Type_HttpMethod;
  }

  public get authorization(): string {
    return this._req.headers['authorization'] || '';
  }

  public get contentLength(): number {
    return Number(this._req.headers['content-length']) || 0;
  }

  public get range(): number[] | null {
    if (!this._req.headers['range']) {
      return null;
    }

    return (
      this._req.headers['range'].replace('bytes=', '').split('-').filter(Boolean).map(Number) ||
      null
    );
  }
}
