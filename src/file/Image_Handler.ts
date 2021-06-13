import { IFileHandler } from './IFileHandler';
import * as Path from 'path';
import Mime from 'mime';
import Sharp from 'sharp';
import * as Fs from 'fs-extra';
import { WS_Context } from '../core/WS_Context';
import { WebServer } from '../WebServer';

export class Image_Handler implements IFileHandler {
  match(path: string): boolean {
    const extension = Path.extname(path);
    return ['.jpg', '.png', '.jpeg', '.gif'].includes(extension);
  }

  async handle(ctx: WS_Context, path: string, args: Record<string, unknown>): Promise<Buffer> {
    const extension = Path.extname(path);
    const method = (args['method'] as string) || '';
    const quality = Number.parseInt(args['quality'] as string) || undefined;
    const rotation = Number.parseInt(args['rotation'] as string) || undefined;
    let width = Number.parseInt(args['width'] as string) || undefined;
    // const crop = ((args['width'] as string) || '').split(',').map(Number);

    const thumbnail = args['thumbnail']
      ? (args['thumbnail'] as string).split('x').map(Number)
      : [undefined, undefined];

    const cachePath = path + JSON.stringify(args);
    ctx.contentType = Mime.getType(extension) || 'application/octet-stream';

    if (
      args['quality'] ||
      args['thumbnail'] ||
      args['rotation'] ||
      args['width'] ||
      args['crop'] ||
      args['method']
    ) {
      return await WebServer.cache.smart<Buffer>(
        cachePath,
        async () => {
          ctx.contentType = 'image/jpeg';
          let buffer = null;
          const FUCK_YOU_DIE = await Fs.readFile(path);

          if (width) {
            if (width <= 1) {
              width = 1;
            }
            if (width >= 1280) {
              width = 1280;
            }
            buffer = await Sharp(FUCK_YOU_DIE)
              .jpeg({ quality: quality || 100 })
              .rotate(rotation)
              .resize(width)
              .withMetadata()
              .toBuffer();
          } else {
            buffer = await Sharp(FUCK_YOU_DIE)
              .jpeg({ quality: quality || 100 })
              .rotate(rotation)
              .resize(thumbnail[0], thumbnail[1])
              .withMetadata()
              .toBuffer();
          }

          /*if (crop.length) {
            const metaData = await Sharp(buffer).metadata();
            const w = metaData.width || 0;
            const h = metaData.height || 0;
            buffer = await Sharp(path)
              .extract({
                left: crop[0] * w,
                top: crop[1] * h,
                width: crop[2] * w,
                height: crop[3] * h,
              })
              .withMetadata()
              .toBuffer();
          }*/

          if (method === 'getSize') {
            ctx.contentType = 'application/json';
            return Buffer.from(
              JSON.stringify({
                size: buffer.length,
              }),
              'utf-8',
            );
          }

          return buffer;
        },
        60,
      );
    }

    return await Fs.readFile(path);
  }
}
