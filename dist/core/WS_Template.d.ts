import EJS from 'ejs';
export declare class WS_Template {
    static template(template: string, data?: EJS.Data, options?: EJS.Options): Promise<string>;
    static file(path: string, data?: EJS.Data, options?: EJS.Options): Promise<string>;
}
