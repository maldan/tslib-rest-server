import { IFileHandler } from './IFileHandler';
import * as Path from 'path';
import * as Mime from 'mime';
import * as Util from 'util';
import * as Fs from 'fs-extra';
import { WS_Context } from '../core/WS_Context';

export class Image_Handler implements IFileHandler {
  private _cache: { [key: string]: unknown } = {};

  match(path: string): boolean {
    const extension = Path.extname(path);
    return ['.jpg', '.png', '.jpeg', '.gif'].includes(extension);
  }

  async handle(ctx: WS_Context, path: string, args: { [key: string]: unknown }): Promise<Buffer> {
    const extension = Path.extname(path);
    // const quality = Number.parseInt(args['quality'] as string);
    // const thumbnail = args['thumbnail'];
    // const cachePath = path + JSON.stringify(args);
    ctx.contentType = Mime.getType(extension) || 'text/plain';

    return await Fs.readFile(path);
  }
}
