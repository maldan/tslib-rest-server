import { IFileHandler } from './IFileHandler';
import { Image_Handler } from './Image_Handler';
import * as Path from 'path';
import * as Mime from 'mime';
import * as Util from 'util';
import * as Fs from 'fs';
import { Video_Handler } from './Video_Handler';
import { WS_Context } from '../core/WS_Context';
import { ReadStream } from 'fs';

const ReadFile = Util.promisify(Fs.readFile);

export class FileHandler {
  private _handlers: IFileHandler[] = [new Image_Handler(), new Video_Handler()];

  public async handle(
    ctx: WS_Context,
    path: string,
    args: { [key: string]: unknown },
  ): Promise<Buffer | ReadStream> {
    /*if (path[path.length - 1] === '/') {
            path += 'index.html';
        }*/

    // Check handlers
    for (let i = 0; i < this._handlers.length; i++) {
      if (this._handlers[i].match(path)) {
        return await this._handlers[i].handle(ctx, path, args);
      }
    }

    // console.log(path);

    // Default return
    const extension = Path.extname(path);
    ctx.contentType = Mime.getType(extension) || 'text/plain';
    return await ReadFile(path);
  }
}
