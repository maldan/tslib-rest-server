/// <reference types="node" />
import { IFileHandler } from './IFileHandler';
import { WS_Context } from '../core/WS_Context';
export declare class Image_Handler implements IFileHandler {
    match(path: string): boolean;
    handle(ctx: WS_Context, path: string, args: Record<string, unknown>): Promise<Buffer>;
}
