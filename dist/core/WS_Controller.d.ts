import { WS_Context } from './WS_Context';
export declare class WS_Controller {
    private readonly _sc;
    private readonly _functionList;
    constructor(staticClass: any);
    execute(ctx: WS_Context, fnName: string, args: any): Promise<unknown>;
}
