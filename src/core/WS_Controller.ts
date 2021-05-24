import { ErrorType, WS_Error } from '../error/WS_Error';
import FunctionHelper from '../util/FunctionHelper';
import StringHelper from '../util/StringHelper';
import { Type_MethodInfo } from '../util/Types';
import { WS_Context } from './WS_Context';

export class WS_Controller {
  private readonly _sc: any;
  private readonly _functionList: { [x: string]: Type_MethodInfo } = {};

  constructor(staticClass: any) {
    this._sc = staticClass;

    const methodList = Object.getOwnPropertyNames(this._sc);

    for (let i = 0; i < methodList.length; i++) {
      if (methodList[i].match(/^get_/)) {
        this._functionList[StringHelper.camelToKebab(methodList[i])] = {
          httpMethod: 'GET',
          function: this._sc[methodList[i]],
        };
      }

      if (methodList[i].match(/^post_/)) {
        this._functionList[StringHelper.camelToKebab(methodList[i])] = {
          httpMethod: 'POST',
          function: this._sc[methodList[i]],
        };
      }

      if (methodList[i].match(/^delete_/)) {
        this._functionList[StringHelper.camelToKebab(methodList[i])] = {
          httpMethod: 'DELETE',
          function: this._sc[methodList[i]],
        };
      }

      if (methodList[i].match(/^put_/)) {
        this._functionList[StringHelper.camelToKebab(methodList[i])] = {
          httpMethod: 'PUT',
          function: this._sc[methodList[i]],
        };
      }

      if (methodList[i].match(/^patch_/)) {
        this._functionList[StringHelper.camelToKebab(methodList[i])] = {
          httpMethod: 'PATCH',
          function: this._sc[methodList[i]],
        };
      }
    }
  }

  async execute(ctx: WS_Context, fnName: string, args: any): Promise<unknown> {
    fnName = StringHelper.camelToKebab(ctx.method.toLowerCase() + '_' + fnName);

    const fn = this._functionList[fnName];
    if (!fn) {
      throw new WS_Error(ErrorType.NOT_FOUND, fnName, 'Method not found', 405);
      // throw new Error(`[405] Method not found!`);
    }

    if (fn.httpMethod !== ctx.method) {
      throw new WS_Error(ErrorType.NOT_FOUND, fnName, 'Method not found', 405);
      // throw new Error(`[405] Method not allowed!`);
    }

    // this._sc['context'] = ctx;
    // this._functionList[fnName].function['sas'] = 1;
    const binded = this._functionList[fnName].function.bind(this._sc, {
      ...args,
      ctx,
      accessToken: ctx.authorization,
    });
    return await binded();

    /*return await FunctionHelper.callFunctionWithArgumentNames(
      this._functionList[fnName].function,
      {
        ...args,
        ctx,
        authorization: ctx.authorization,
      },
      this._sc,
    );*/
  }
}
