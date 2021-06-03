import { WS_Router } from './core/WS_Router';
import { CacheMan } from './util/CacheMan';
export declare class WebServer {
    private _wr;
    private _server;
    static docsRoot: string;
    static docsDescription: string;
    static cache: CacheMan;
    static adminPassword: string;
    static isGenerateDocumentation: boolean;
    constructor(routers?: WS_Router[]);
    registerRouter(wr: WS_Router): void;
    createRouter(prefix?: string, classes?: any[], folders?: string[]): WS_Router;
    parseQueryParams(url: string): any;
    listen(port: number): void;
    destroy(): void;
}
