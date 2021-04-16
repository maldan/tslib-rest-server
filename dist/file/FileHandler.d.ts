/// <reference types="node" />
import { WS_Context } from '../core/WS_Context';
import { ReadStream } from 'fs';
export declare class FileHandler {
    private _handlers;
    handle(ctx: WS_Context, path: string, args: {
        [key: string]: unknown;
    }): Promise<Buffer | ReadStream>;
}
