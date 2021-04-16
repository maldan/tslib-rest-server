/// <reference types="node" />
import { IFileHandler } from './IFileHandler';
import { WS_Context } from '../core/WS_Context';
import { ReadStream } from 'fs';
export declare class Video_Handler implements IFileHandler {
    private _cache;
    match(path: string): boolean;
    handle(ctx: WS_Context, path: string, args: {
        [key: string]: unknown;
    }): Promise<Buffer | ReadStream>;
}
