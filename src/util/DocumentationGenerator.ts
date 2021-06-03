import { ConfigParams } from '../core/WS_Decorator';
import * as Fs from 'fs';
import { WebServer } from '../WebServer';
import { WS_Error } from '../error/WS_Error';
import { WS_Template } from '../core/WS_Template';

export type Type_DocumentStruct = {
  className: string;
  method: string;
  functionName: string;
  isRequiresAuthorization: boolean;
  isReturnAccessToken: boolean;
  useJsonWrapper: boolean;
  description: string;
  examples: ConfigParams['examples'];
  /*isNotEmpty: ConfigParams['isNotEmpty'];
  isPositive: ConfigParams['isPositive'];
  isInteger: ConfigParams['isInteger'];
  isNumber: ConfigParams['isNumber'];
  isMatch: ConfigParams['isMatch'];
  isValid: ConfigParams['isValid'];*/
  struct: ConfigParams['struct'];
};

function buildJson(json: string): string {
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

function buildResponse(useJsonWrapper: boolean, r: any): unknown {
  if (useJsonWrapper) {
    if (r instanceof WS_Error) {
      return {
        status: false,
        ...r,
      };
    } else {
      return {
        status: true,
        response: r,
      };
    }
  } else {
    return r;
  }
}

function buildForm(struct: any, id: number): string {
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

export class DocumentationGenerator {
  private static _sas: Type_DocumentStruct[] = [];

  static add(params: Type_DocumentStruct): void {
    this._sas.push(params);
  }

  static async generate(): Promise<void> {
    let out = ``;
    for (let i = 0; i < this._sas.length; i++) {
      const item = this._sas[i];
      const path = `/api/${item.className}/${
        item.functionName === 'index' ? '' : item.functionName
      }`;

      out += `
       <div class="api-call">
        <div class="method ${item.method.toUpperCase()}">${item.method.toUpperCase()}</div>
        <div class="path">${path}</div>
        ${
          item.isRequiresAuthorization
            ? '<div class="auth" title="Requires authorization token">AUTH</div>'
            : ''
        }
       </div>
       <div style="display: flex;">
        <div style="margin-right: 15px; width: 500px;">
          <div class="description">${item.description}</div>
          <pre class="struct">${buildJson(JSON.stringify(item.struct, null, 4))}</pre>
          <div class="example" style="position: relative; min-height: 16px;">
            ${buildForm(item.struct, i)}
            <svg class="run-query" data-id="${i}" data-path="${path}" data-method="${
        item.method
      }" data-is-return-access-token="${
        item.isReturnAccessToken
      }" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
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
          ${item.examples
            ?.map((x, i) => {
              return `
                <div class="example">
                  <div>
                    <div style="flex: 1;">
                      <pre class="request">${buildJson(JSON.stringify(x.request, null, 4))}</pre>
                    </div>
                    <div class="goto"></div>
                    <div style="flex: 1;">
                      <pre class="response">${buildJson(
                        JSON.stringify(buildResponse(item.useJsonWrapper, x.response), null, 4),
                      )}</pre>
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')}
          </div>
        </div>
        <hr>
      `;
    }

    Fs.writeFileSync(
      `${WebServer.docsRoot}/index.html`,
      await WS_Template.file(__dirname + '/../../src/doc/index.ejs', {
        description: WebServer.docsDescription,
        buildJson: `
          <script>
          ${buildJson.toString()}
          </script>
        `,
        out,
      }),
    );
  }
}
