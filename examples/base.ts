import { WebServer, WS_Router } from './../dist';
import { MainApi } from './MainApi';

const web = new WebServer([new WS_Router('api', [MainApi]), new WS_Router('', [], ['./build'])]);
web.listen(3100);
