/// <reference types="node" />
import { ReadStream } from 'fs';
import { WS_Context } from '../core/WS_Context';
export interface IFileHandler {
    match(path: string): boolean;
    handle(ctx: WS_Context, path: string, args: {
        [key: string]: unknown;
    }): Promise<Buffer | ReadStream>;
}
