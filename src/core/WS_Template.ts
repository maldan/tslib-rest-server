// @ts-ignore
import * as EJS from 'ejs';

export class WS_Template {
  static async file(path: string, data?: EJS.Data, options?: EJS.Options): Promise<string> {
    return await EJS.renderFile(path, data, options); //
  }
}
