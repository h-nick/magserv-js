const net = require('net');
const { expect } = require('chai');
const sinon = require('sinon');
const HttpServer = require('../src/http_server');

const clientConfig = {
  host: '127.0.0.1',
  port: 8124,
  localAddress: '127.0.0.1',
  family: 4,
};

console.log = () => { }; // Skipping console.logs.

describe('Socket connectivity', () => {
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

  it('Should connect successfully to the server', (done) => {
    this.currentTest.handler = (data) => {
      const expMsg = data.toString('utf-8').split('\r\n')[0];
      expect(expMsg).to.be.a('string');
      expect(expMsg).to.equal('Successful connection.');

      done();
    };

    this.currentTest.client.connect(clientConfig);
    this.currentTest.client.on('data', this.currentTest.handler);
  });

  it('Should disconnect successfully', (done) => {
    const buffer = [];

    this.currentTest.handler = (data) => {
      buffer.push(data.toString('utf-8'));

      if (this.currentTest.handler.callCount > 1) {
        const expMsg = buffer[buffer.length - 1].split('\r\n')[0];
        expect(expMsg).to.be.a('string');
        expect(expMsg).to.equal('Finished. Bye!');

        done();
      }
    };

    sinon.spy(this.currentTest, 'handler');

    this.currentTest.client.connect(clientConfig);
    this.currentTest.client.end();

    this.currentTest.client.on('data', this.currentTest.handler);
  });
});
