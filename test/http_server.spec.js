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

    const assertRes = (err, { headers, statusCode, httpVersion }, status) => {
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

    it('return HTTP 404 when requesting a resource that does not exist', (done) => {
      chai.request(this.connection)
        .get('/404')
        .end((err, res) => {
          const result = assertRes(err, res.res, 404);
          chai.expect(result).to.be.true;
          done();
        });
    });

    it('return HTTP 200 with Content-Type "text/plain" when requesting test.txt', (done) => {
      chai.request(this.connection)
        .get('/test.txt')
        .end((err, res) => {
          const result = assertRes(err, res.res, 200);
          chai.expect(result).to.be.true;
          chai.expect(res).header('content-type', 'text/plain; charset=utf-8');
          chai.expect(res).to.be.text;
          done();
        });
    });

    it('return HTTP 200 with Content-Type "text/plain" when requesting test/test.txt', (done) => {
      chai.request(this.connection)
        .get('/test/test.txt')
        .end((err, res) => {
          const result = assertRes(err, res.res, 200);
          chai.expect(result).to.be.true;
          chai.expect(res).header('content-type', 'text/plain; charset=utf-8');
          chai.expect(res).to.be.text;
          done();
        });
    });

    it('return HTTP 200 with Content-Type "text/html" when requesting /', (done) => {
      chai.request(this.connection)
        .get('/')
        .end((err, res) => {
          const result = assertRes(err, res.res, 200);
          chai.expect(result).to.be.true;
          chai.expect(res).header('content-type', 'text/html; charset=utf-8');
          chai.expect(res).to.be.html;
          done();
        });
    });
  });
});
