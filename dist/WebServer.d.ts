import { WS_Router } from './core/WS_Router';
export declare class WebServer {
    private _wr;
    constructor(routers?: WS_Router[]);
    registerRouter(wr: WS_Router): void;
    createRouter(prefix?: string, classes?: any[], folders?: string[]): WS_Router;
    parseQueryParams(url: string): any;
    listen(port: number): void;
}
