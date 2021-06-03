"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationGenerator = void 0;
const Fs = __importStar(require("fs"));
const Path = __importStar(require("path"));
const WebServer_1 = require("../WebServer");
const WS_Error_1 = require("../error/WS_Error");
const WS_Template_1 = require("../core/WS_Template");
function buildJson(json) {
    return json.replace(/"(.*?)": (.*)/g, (match, p1, p2) => {
        let comma = '';
        if (p2[p2.length - 1] === ',') {
            p2 = p2.slice(0, -1);
            comma = ',';
        }
        let type = 'string';
        if (p2 === 'true' || p2 === 'false') {
            type = 'boolean';
        }
        if (p2 === 'null') {
            type = 'null';
        }
        if (!Number.isNaN(Number(p2))) {
            type = 'number';
        }
        return `<span class="json-key">"${p1}"</span>: <span class="json-value ${type}">${p2}</span>${comma}`;
    });
}
function buildResponse(useJsonWrapper, r) {
    if (useJsonWrapper) {
        if (r instanceof WS_Error_1.WS_Error) {
            return Object.assign({ status: false }, r);
        }
        else {
            return {
                status: true,
                response: r,
            };
        }
    }
    else {
        return r;
    }
}
function buildForm(struct, id) {
    struct = JSON.parse(JSON.stringify(struct));
    let out = `<form id="form-${id}">`;
    for (const key in struct) {
        let type = 'text';
        struct[key] = struct[key].replace('?', '');
        if (struct[key] === 'number') {
            type = 'number';
        }
        if (struct[key] === 'date') {
            type = 'date';
        }
        if (struct[key] === 'email') {
            type = 'email';
        }
        if (struct[key] === 'file') {
            type = 'file';
        }
        out += `<input name=${key} type="${type}" placeholder="${key}" multiple>`;
    }
    out += `</form>`;
    return out;
}
class DocumentationGenerator {
    static add(params) {
        this._sas.push(params);
    }
    static generate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let out = ``;
            for (let i = 0; i < this._sas.length; i++) {
                const item = this._sas[i];
                const path = `/api/${item.className}/${item.functionName === 'index' ? '' : item.functionName}`;
                out += `
       <div class="api-call">
        <div class="method ${item.method.toUpperCase()}">${item.method.toUpperCase()}</div>
        <div class="path">${path}</div>
        ${item.isRequiresAuthorization
                    ? '<div class="auth" title="Requires authorization token">AUTH</div>'
                    : ''}
       </div>
       <div style="display: flex;">
        <div style="margin-right: 15px; width: 500px;">
          <div class="description">${item.description}</div>
          <pre class="struct">${buildJson(JSON.stringify(item.struct, null, 4))}</pre>
          <div class="example" style="position: relative; min-height: 16px;">
            ${buildForm(item.struct, i)}
            <svg class="run-query" data-id="${i}" data-path="${path}" data-method="${item.method}" data-is-return-access-token="${item.isReturnAccessToken}" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              viewBox="0 0 494.148 494.148" style="enable-background:new 0 0 494.148 494.148; width: 24px; cursor: pointer; position: absolute; right: 10px; top: 10px;" xml:space="preserve">
              <g>
                <g>
                  <path style="fill: #09a349;" d="M405.284,201.188L130.804,13.28C118.128,4.596,105.356,0,94.74,0C74.216,0,61.52,16.472,61.52,44.044v406.124
                    c0,27.54,12.68,43.98,33.156,43.98c10.632,0,23.2-4.6,35.904-13.308l274.608-187.904c17.66-12.104,27.44-28.392,27.44-45.884
                    C432.632,229.572,422.964,213.288,405.284,201.188z"/>
                </g>
              </g>
            </svg>
          </div>
          <pre id="result-${i}" class="response">...</pre>
        </div>
        <div style="flex: 1;">
          ${(_a = item.examples) === null || _a === void 0 ? void 0 : _a.map((x, i) => {
                    return `
                <div class="example">
                  <div>
                    <div style="flex: 1;">
                      <pre class="request">${buildJson(JSON.stringify(x.request, null, 4))}</pre>
                    </div>
                    <div class="goto"></div>
                    <div style="flex: 1;">
                      <pre class="response">${buildJson(JSON.stringify(buildResponse(item.useJsonWrapper, x.response), null, 4))}</pre>
                    </div>
                  </div>
                </div>
              `;
                }).join('')}
          </div>
        </div>
        <hr>
      `;
            }
            Fs.writeFileSync(`${WebServer_1.WebServer.docsRoot}/index.html`, yield WS_Template_1.WS_Template.file(Path.dirname(process.execPath) +
                '/node_modules/@maldan/tslib-rest-server/dist/doc/index.ejs', {
                description: WebServer_1.WebServer.docsDescription,
                buildJson: `
          <script>
          ${buildJson.toString()}
          </script>
        `,
                out,
            }));
        });
    }
}
exports.DocumentationGenerator = DocumentationGenerator;
DocumentationGenerator._sas = [];
