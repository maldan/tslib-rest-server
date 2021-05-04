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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationGenerator = void 0;
const Fs = __importStar(require("fs"));
const WebServer_1 = require("../WebServer");
const WS_Error_1 = require("../error/WS_Error");
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
    let out = `<form id="form-${id}">`;
    for (const key in struct) {
        let type = 'text';
        if (struct[key] === 'number') {
            type = 'number';
        }
        if (struct[key] === 'date') {
            type = 'date';
        }
        if (struct[key] === 'email') {
            type = 'email';
        }
        out += `<input name=${key} type="${type}" placeholder="${key}">`;
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
        let out = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Documentation</title>
      <style>
        body {
          margin: 0;
          padding: 30px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
            'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: #333333;
        }
        
        code {
          font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
        }

        .api-call {
          display: flex;
          align-items: center;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .description {
          line-height: 24px;
          font-size: 16px;
          background: #252525;
          padding: 15px;
          border-radius: 6px;
          color: #b9b9b9;
          margin-bottom: 15px;
        }

        .method {
          background: #c57b1f;
          padding: 5px 10px;
          border-radius: 5px 0px 0px 5px;
          color: #fefefe;
          font-weight: bold;
        }

        .method.GET {
          background: #1f79c5;
        }

        .method.DELETE {
          background: #af0f2d;
        }
        
        .auth {
          background: #5c8609;
          padding: 5px 10px;
          border-radius: 5px;
          font-weight: bold;
          margin-left: 20px;
          color: #c7eab9;
        }

        .path {
          background: #232323;
          font-weight: bold;
          padding: 5px 10px;
          border-radius: 0px 5px 5px 0px;
          color: #eabc55;
        }

        .example {
          background: #252525;
          padding: 15px;
          margin: 0;
          color: #b9b9b9;
          border-radius: 5px;
          margin-bottom: 15px;
        }

        .struct {
          background: #151515;
          padding: 15px;
          border-radius: 7px;
          color: #989898;
          white-space: pre-wrap;
          margin-bottom: 15px;
        }

        .struct .json-key, .request .json-key {
          color: #ffb060;
        }

        .response .json-key {
          color: #e2801b;
        }

        .request {
          background: #151515;
          padding: 15px;
          border-radius: 7px;
          color: #989898;
          white-space: pre-wrap;
          margin-bottom: 15px;
        }

        .response {
          background: #151515;
          padding: 15px;
          border-radius: 7px;
          color: #989898;
          white-space: pre-wrap;
        }
        h3 {
          margin: 0;
          margin-bottom: 10px;
        }
        h4 {
          margin: 0;
          margin-bottom: 5px;
        }

        .goto {
          font-weight: bold;
          font-size: 22px;
          width: 25px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .json-value.string {
          color: #26b133;
        }
        .json-value.boolean {
          color: #77a0e0;
        }
        .json-value.number {
          color: #feb400;
        }
        .json-value.null {
          color: #ea640f;
          font-weight: bold;
        }

        pre {
          margin: 0;
        }

        input {
          outline: none;
          border: 0;
          background: #151515;
          padding: 10px;
          color: #9c9c9c;
          margin-right: 5px;
          margin-bottom: 5px;
        }

        hr {
          margin-bottom: 50px;
          margin-top: 50px;
          border: 1px solid #5d5d5d;
        }

        .description hr {
          margin-bottom: 25px;
          margin-top: 25px;
        }

        ::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
        }
      </style>
    </head>
    <body>
    <div class="description" style="margin-bottom: 50px;">${WebServer_1.WebServer.docsDescription}</div>
    `;
        for (let i = 0; i < this._sas.length; i++) {
            const item = this._sas[i];
            const path = `/api/${item.className}/${item.functionName}`;
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
        out += `
    <script>
      ${buildJson.toString()}

      async function makeQuery(path, method, data, id, isReturnAccessToken) {
        const queryString = method.toUpperCase() === 'POST' ?'' :Object.keys(data).map(key => key + '=' + data[key]).join('&');

        const response = await fetch(window.location.origin + path + '?' + queryString, {
          method,
          headers: {
            'Authorization': localStorage.getItem('testApi_accessToken'),
            'Content-Type': 'application/json'
          },
          body: method.toUpperCase() === 'POST' ?JSON.stringify(data) :undefined
        });
        const json = await response.json();
        if (isReturnAccessToken) {
          if (typeof json === "string") {
            localStorage.setItem('testApi_accessToken', json);
          } else {
            localStorage.setItem('testApi_accessToken', json.response);
          }
        }
        document.querySelector('#result-' + id).innerHTML = buildJson(JSON.stringify(json, null, 4));
      }

      document.querySelectorAll('.run-query').forEach(x => {
        const id = x.getAttribute('data-id');
        const path = x.getAttribute('data-path');
        const method = x.getAttribute('data-method');
        const isReturnAccessToken = x.getAttribute('data-is-return-access-token') === 'true';

        x.addEventListener('click', (e) => {
          const input = document.querySelectorAll('#form-' + id + ' > input');
          const formData = {};
          input.forEach(y => {
            formData[y.getAttribute('name')] = y.value;
          });
          makeQuery(path, method, formData, id, isReturnAccessToken);
        });
      });

      document.querySelectorAll('.window-location-origin').forEach(x => {
        x.innerHTML = window.location.origin;
      });
    </script>
    </body></html>`;
        Fs.writeFileSync(`${WebServer_1.WebServer.docsRoot}/index.html`, out);
    }
}
exports.DocumentationGenerator = DocumentationGenerator;
DocumentationGenerator._sas = [];