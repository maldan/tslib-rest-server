import EJS from 'ejs';

export class WS_Template {
  static async template(template: string, data?: EJS.Data, options?: EJS.Options): Promise<string> {
    return await EJS.render(template, data, options); //
  }

  static async file(path: string, data?: EJS.Data, options?: EJS.Options): Promise<string> {
    return await EJS.renderFile(path, data, options); //
  }
}
