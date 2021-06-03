import { Config } from '../core/WS_Decorator';
import { WebServer } from '../WebServer';

export class DebugApi {
  static path = 'debug';

  @Config({
    useJsonWrapper: false,
  })
  static get_index(): string {
    return 'sas';
  }

  static get_cacheInfo(): unknown {
    return WebServer.cache.stat;
  }
}
