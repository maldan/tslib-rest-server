import { Config, ErrorType, WebServer, WS_Router } from './../src';
import Axios from 'axios';
import * as Chai from 'chai';

class TestApi {
  static path: string = 'test';

  static get_index(): unknown {
    return 'test';
  }

  @Config({
    useJsonWrapper: true,
  })
  static get_gas(): unknown {
    return 'sasageo';
  }

  @Config({
    useJsonWrapper: true,
    struct: {
      a: 'number',
      b: 'number',
    },
  })
  static post_add({ a, b }: { a: number; b: number }): number {
    return a + b;
  }
}

const API_PORT = (34120 + Math.random() * 15000) | 0;
const API_URL = `http://localhost:${API_PORT}`;
const WEB = new WebServer([new WS_Router('api', [TestApi])]);

const API_GET = async (url: string) => {
  try {
    return (await Axios.get(url)).data;
  } catch (e) {
    return e.response.data;
  }
};

const API_POST = async (url: string, data: any) => {
  try {
    return (
      await Axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).data;
  } catch (e) {
    return e.response.data;
  }
};

describe('Base', function () {
  before(async function () {
    WEB.listen(API_PORT);
    console.log(`test on ${API_URL}`);
  });

  it('sas', async function () {
    return new Promise((resolve: any) => {
      setTimeout(() => {
        resolve();
      }, 32);
    });
  });

  it('basic', async function () {
    const d = await API_GET(`${API_URL}/api/test`);
    Chai.assert.equal(d, 'test');

    const d1 = await API_GET(`${API_URL}/api/test/gas`);
    Chai.assert.equal(d1.status, true);
    Chai.assert.equal(d1.response, 'sasageo');
  });

  it('add numbers', async function () {
    // Check wrong method type
    const d = await API_GET(`${API_URL}/api/test/add`);
    Chai.assert.equal(d.status, false);
    Chai.assert.equal(d.type, ErrorType.NOT_FOUND);

    // Check correct
    const d1 = await API_POST(`${API_URL}/api/test/add`, { a: 1, b: 2 });
    Chai.assert.equal(d1.response, 3);

    // Check wrong params
    const d2 = await API_POST(`${API_URL}/api/test/add`, { a: 1, b: 'sas' });
    Chai.assert.equal(d2.status, false);
    Chai.assert.equal(d2.type, ErrorType.TYPE_MISMATCH);
    Chai.assert.equal(d2.value, 'b');

    // Check null params
    const d3 = await API_POST(`${API_URL}/api/test/add`, {});
    Chai.assert.equal(d3.status, false);
    Chai.assert.equal(d3.type, ErrorType.EMPTY_FIELD);
  });

  after(async function () {
    WEB.destroy();
  });
});
