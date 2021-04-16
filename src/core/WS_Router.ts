import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import * as Mime from 'mime';
import { FileHandler } from '../file/FileHandler';
import StringHelper from '../util/StringHelper';
import { WS_Controller } from './WS_Controller';
import { WS_Context } from './WS_Context';

const ReadFile = Util.promisify(Fs.readFile);
const Exists = Util.promisify(Fs.exists);

export class WS_Router {
  public readonly prefix: string = '';

  private _controllers: { [x: string]: WS_Controller } = {};
  private _folders: string[] = [];
  private _fileHandler: FileHandler = new FileHandler();

  constructor(prefix: string = '', classes: any[] = [], folders: string[] = []) {
    this.prefix = prefix;

    for (let i = 0; i < classes.length; i++) {
      this.registerClass(classes[i]);
    }
    for (let i = 0; i < folders.length; i++) {
      this.registerFolder(folders[i]);
    }
  }

  async findInFolder(path: string): Promise<string | null> {
    if (path.slice(-1) === '/') {
      path += 'index.html';
    }
    for (let i = 0; i < this._folders.length; i++) {
      if (await Exists(this._folders[i] + path)) {
        return this._folders[i] + path;
      }
    }

    return null;
  }

  async match(path: string): Promise<boolean> {
    if (path.slice(-1) === '/') {
      path += 'index.html';
    }
    const t = path.split('/').filter(Boolean);

    if (this.prefix) {
      if (t[0] === this.prefix && (await this.findInFolder('/' + t.slice(1).join('/')))) {
        return true;
      }
      return !!(t[0] === this.prefix && this._controllers[t[1]]);
    } else {
      if (await this.findInFolder(path)) {
        return true;
      }
      return !!this._controllers[t[0]];
    }
  }

  async resolve(ctx: WS_Context, path: string, args: any): Promise<any> {
    const t = path.split('/').filter(Boolean);
    const realPath = this.prefix ? '/' + t.slice(1).join('/') : path;
    const filePath = await this.findInFolder(realPath);

    if (filePath) {
      return await this._fileHandler.handle(ctx, filePath, args);
    }

    if (this.prefix) {
      if (!this._controllers[t[1]]) {
        throw new Error(`[405] Controller not found!`);
      }

      return await this._controllers[t[1]].execute(ctx, t[2] || 'index', args);
    } else {
      if (!this._controllers[t[0]]) {
        throw new Error(`[405] Controller not found!`);
      }

      return await this._controllers[t[0]].execute(ctx, t[1] || 'index', args);
    }
  }

  registerClass(c: any) {
    const controllerName = c.path ?? StringHelper.camelToKebab(c.name);
    this._controllers[controllerName] = new WS_Controller(c);
  }

  registerFolder(path: string) {
    this._folders.push(path);
    console.log(this._folders);
  }
}
