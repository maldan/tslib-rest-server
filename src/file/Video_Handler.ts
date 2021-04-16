import { IFileHandler } from './IFileHandler';
import * as Path from 'path';
import * as Util from 'util';
import * as Fs from 'fs';
import * as Mime from 'mime';
import { WS_Context } from '../core/WS_Context';
import { ReadStream } from 'fs';

const Stat = Util.promisify(Fs.stat);

export class Video_Handler implements IFileHandler {
  private _cache: { [key: string]: unknown } = {};

  match(path: string): boolean {
    const extension = Path.extname(path);
    return ['.mp4'].includes(extension);
  }

  async handle(
    ctx: WS_Context,
    path: string,
    args: { [key: string]: unknown },
  ): Promise<Buffer | ReadStream> {
    const extension = Path.extname(path);
    const thumbnail = args['thumbnail'];
    const cachePath = path + JSON.stringify(args);

    /*if (this._cache[cachePath]) {
      ctx.contentType = 'image/jpeg';
      return this._cache[cachePath];
    }*/

    ctx.contentType = Mime.getType(extension) || 'text/plain';
    ctx.status = 206;
    ctx.acceptRanges = 'bytes';

    if (ctx.range) {
      const fileInfo = await Stat(path);
      const start = ctx.range[0];
      const end = ctx.range[1] ?? fileInfo.size - 1;
      ctx.contentRange = `bytes ${start}-${end}/${fileInfo.size}`;
      return Fs.createReadStream(path, { start, end });
    } else {
      const fileInfo = await Stat(path);
      ctx.contentRange = `${0}-${fileInfo.size - 1}/${fileInfo.size}`;
      return Buffer.from([]);
    }
  }
}
