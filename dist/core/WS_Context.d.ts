/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { Type_HttpHeaders, Type_HttpMethod } from '../util/Types';
import { ReadStream } from 'fs';
export declare class WS_Context {
    private _req;
    private _res;
    private _fileHandler;
    status: number;
    headers: Type_HttpHeaders;
    useJsonWrapper: boolean;
    constructor(req: IncomingMessage, res: ServerResponse);
    handleFile(path: string, args?: {
        [key: string]: unknown;
    }): Promise<Buffer | ReadStream>;
    set contentType(type: string);
    set acceptRanges(val: string);
    set contentRange(val: string);
    get method(): Type_HttpMethod;
    get authorization(): string;
    get contentLength(): number;
    get range(): number[] | null;
}
