import { WS_DefaultClass } from '../dist';

export class MainApi extends WS_DefaultClass {
  static path: string = 'activity';

  static get_index(): unknown {
    return 'hello';
  }
}
