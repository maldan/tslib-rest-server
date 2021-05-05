import { WebServer, WS_Router } from './../dist';
import { MainApi } from './MainApi';

const ws = new WebServer();
// Init web server
const web = new WebServer([new WS_Router('api', [MainApi]), new WS_Router('', [], ['./build'])]);
ws.listen(3100); ////
