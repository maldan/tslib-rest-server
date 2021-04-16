import { WS_Context } from './WS_Context';
export declare class WS_Router {
    readonly prefix: string;
    private _controllers;
    private _folders;
    private _fileHandler;
    constructor(prefix?: string, classes?: any[], folders?: string[]);
    findInFolder(path: string): Promise<string | null>;
    match(path: string): Promise<boolean>;
    resolve(ctx: WS_Context, path: string, args: any): Promise<any>;
    registerClass(c: any): void;
    registerFolder(path: string): void;
}
