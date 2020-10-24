/* eslint-disable no-unused-expressions */

const chaiHttp = require('chai-http');
const chai = require('chai');
const { HttpServer } = require('../src/http_server');

chai.use(chaiHttp);
console.log = () => { }; // Skipping console.logs.

describe('Integration tests:', () => {
  describe('HTTP server should-', () => {
    before(() => {
      this.connection = 'http://localhost:8124';
      this.server = new HttpServer();
      this.server.init();
    });

    after(() => {
      this.server.close();
    });

    const assertRes = (err = undefined, { headers, statusCode, httpVersion }, status) => {
      if (!err) {
        if (
          Object.keys(headers).length
          && statusCode === status
          && httpVersion === '1.0'
          && headers.server === 'massive-magenta'
        ) {
          return true;
        }
      }

      return false;
    };

    it('return HTTP 400 for a non-valid HTTP request', (done) => {
      chai.request(this.connection)
        .get('/')
        .set('Content-Length', '') // Removing headers set up by Chai.
        .set('User-Agent', '')
        .set('Accept-Encoding', '')
        .set('Host', '')
        .set('Connection', '')
        .end((err, res) => {
          const result = assertRes(err, res.res, 400);
          chai.expect(result).to.be.true;
          done();
        });
    });

    it('return HTTP 404 for a non-valid URL if no index.html is available', (done) => {
      chai.request(this.connection)
        .get('/test///')
        .end((err, res) => {
          const result = assertRes(err, res.res, 404);
          chai.expect(result).to.be.true;
          done();
        });
    });

    it('return HTTP 404 for a dir path URL with no index.html', async () => {
      const res1 = await chai.request(this.connection).get('/test');
      const assert1 = assertRes(undefined, res1.res, 404);
      chai.expect(assert1).to.be.true;

      const res2 = await chai.request(this.connection).get('/test/');
      const assert2 = assertRes(undefined, res2.res, 404);
      chai.expect(assert2).to.be.true;
    });

    it('return HTTP 404 when requesting a resource that does not exist', (done) => {
      chai.request(this.connection)
        .get('/404')
        .end((err, res) => {
          const result = assertRes(err, res.res, 404);
          chai.expect(result).to.be.true;
          done();
        });
    });

    it('return HTTP 200 with proper headers when requesting test.txt', (done) => {
      chai.request(this.connection)
        .get('/test.txt')
        .end((err, res) => {
          const result = assertRes(err, res.res, 200);
          chai.expect(result).to.be.true;
          chai.expect(res).header('content-type', 'text/plain; charset=utf-8');
          chai.expect(res).header('content-length', '126');
          chai.expect(res).to.be.text;
          done();
        });
    });

    it('return HTTP 200 with proper headers when requesting test/test.txt', (done) => {
      chai.request(this.connection)
        .get('/test/test.txt')
        .end((err, res) => {
          const result = assertRes(err, res.res, 200);
          chai.expect(result).to.be.true;
          chai.expect(res).header('content-type', 'text/plain; charset=utf-8');
          chai.expect(res).header('content-length', '144');
          chai.expect(res).to.be.text;
          done();
        });
    });

    it('return HTTP 200 with proper headers when requesting /', (done) => {
      chai.request(this.connection)
        .get('/')
        .end((err, res) => {
          const result = assertRes(err, res.res, 200);
          chai.expect(result).to.be.true;
          chai.expect(res).header('content-type', 'text/html; charset=utf-8');
          chai.expect(res).header('content-length', '221');
          chai.expect(res).to.be.html;
          done();
        });
    });

    it('return HTTP 200 with proper headers and handle trailing slashes', async () => {
      const res1 = await chai.request(this.connection).get('/index.html/');
      const assert1 = assertRes(undefined, res1.res, 200);
      chai.expect(assert1).to.be.true;
      chai.expect(res1).header('content-type', 'text/html; charset=utf-8');
      chai.expect(res1).header('content-length', '221');
      chai.expect(res1).to.be.html;

      const res2 = await chai.request(this.connection).get('/////');
      const assert2 = assertRes(undefined, res2.res, 200);
      chai.expect(assert2).to.be.true;
      chai.expect(res2).header('content-type', 'text/html; charset=utf-8');
      chai.expect(res2).header('content-length', '221');
      chai.expect(res2).to.be.html;

      const res3 = await chai.request(this.connection).get('/test/test.txt/');
      const assert3 = assertRes(undefined, res3.res, 200);
      chai.expect(assert3).to.be.true;
      chai.expect(res3).header('content-type', 'text/plain; charset=utf-8');
      chai.expect(res3).header('content-length', '144');
      chai.expect(res3).to.be.text;
    });
  });
});
