const net = require('net');
const { expect } = require('chai');
// const sinon = require('sinon');
const { HttpServer } = require('../src/http_server');

const clientConfig = {
  host: '127.0.0.1',
  port: 8124,
  localAddress: '127.0.0.1',
  family: 4,
};

console.log = () => { }; // Skipping console.logs.

describe('HTTP server test suite', () => {
  before(() => {
    this.currentTest = {};

    this.currentTest.server = new HttpServer();
    this.currentTest.server.init();
  });

  after(() => {
    this.currentTest.server.close();
  });

  beforeEach(() => {
    this.currentTest.client = new net.Socket();
  });

  afterEach(() => {
    this.currentTest.client.off('data', this.currentTest.handler);
    this.currentTest.client.destroy();
  });

  describe('Server on...', () => {
    it('socket disconnect should write appropriate data to socket', (done) => {
      this.currentTest.handler = (data) => {
        const expMsg = data.toString('utf-8').split('\r\n')[0];
        expect(expMsg).to.be.a('string');
        expect(expMsg).to.equal('Finished. Bye!');

        done();
      };

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.end();

      this.currentTest.client.on('data', this.currentTest.handler);
    });
  });

  describe('Socket when...', () => {
    it('sending a non-valid structure should error.', (done) => {
      this.currentTest.handler = (data) => {
        const expMsg = data.toString('utf-8').split('\r\n')[0];
        expect(expMsg).to.be.a('string');
        expect(expMsg).to.equal('ERROR Method, Resource or Version missing from request.');

        done();
      };

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('.');
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending correct structure with non-valid method should error.', (done) => {
      this.currentTest.handler = (data) => {
        const expMsg = data.toString('utf-8').split('\r\n')[0];
        expect(expMsg).to.be.a('string');
        expect(expMsg).to.equal('ERROR Non-valid request.');

        done();
      };

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('TEST / http/1.1');
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending correct structure with GET method should receive an answer.', (done) => {
      this.currentTest.handler = (data) => {
        const expMsg = data.toString('utf-8').split('\r\n')[0];
        expect(expMsg).to.be.a('string');
        expect(expMsg).to.equal('ANSWER GET / http/1.1');

        done();
      };

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('GET / http/1.1');
      this.currentTest.client.on('data', this.currentTest.handler);
    });
  });
});
