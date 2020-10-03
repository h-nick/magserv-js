const net = require('net');
const chai = require('chai');
const { expect } = require('chai');
const HttpServer = require('../src/http_server');

describe('Socket connectivity', () => {
  let server;
  let client;

  before(() => {
    server = new HttpServer();
    server.init();
  });

  after(() => {
    server.close();
  });

  beforeEach(() => {
    client = new net.Socket();
    client.connect({
      host: '127.0.0.1',
      port: 8124,
      localAddress: '127.0.0.1',
      localPort: Math.ceil(Math.random() * (55555 - 53000 + 1) + 53000),
      family: 4,
    });
  });

  it('should connect successfully to the server', () => {
    client.on('data', (data) => {
      const expMessage = data.toString('utf-8').split('\r\n')[0];

      chai.expect(expMessage).to.be.a('string');
      chai.expect(expMessage).to.equal('Successful connection.');
    });

    client.end();
  });
});
