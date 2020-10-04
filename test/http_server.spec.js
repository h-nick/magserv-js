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
    it('socket connect should write appropriate data to socket', (done) => {
      this.currentTest.handler = (data) => {
        const expMsg = data.toString('utf-8').split('\r\n')[0];
        expect(expMsg).to.be.a('string');
        expect(expMsg).to.equal('Successful connection.');

        done();
      };

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('socket disconnect should write appropriate data to socket', (done) => {
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

  describe('Socket when...', () => {
    it('successfully connected should receive available commands', (done) => {
      this.currentTest.handler = (data) => {
        const expMsg = data.toString('utf-8').split('\r\n')[1];
        expect(expMsg).to.be.a('string');
        expect(expMsg).to.equal('Available commands: GET, SET, CLEAR, ALL.');

        done();
      };

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending GET without a parameter should return an error', (done) => {
      this.currentTest.handler = (data) => {
        if (this.currentTest.handler.callCount > 0) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];
          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ERROR Expected format is: GET <word>.');

          done();
        }
      };

      sinon.spy(this.currentTest, 'handler');

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('GET');
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending GET for a non-existen word should return an error', (done) => {
      this.currentTest.handler = (data) => {
        if (this.currentTest.handler.callCount > 0) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];
          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ERROR Could not find the specified word.');

          done();
        }
      };

      sinon.spy(this.currentTest, 'handler');

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('GET potato');
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending ALL before any SET should return an error', (done) => {
      this.currentTest.handler = (data) => {
        if (this.currentTest.handler.callCount > 0) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];
          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ERROR There are no words saved.');

          done();
        }
      };

      sinon.spy(this.currentTest, 'handler');

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('ALL');
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending SET with 0 parameters should return an error', (done) => {
      this.currentTest.handler = (data) => {
        if (this.currentTest.handler.callCount > 0) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];
          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ERROR Expected format is: SET <word> <desc>');

          done();
        }
      };

      sinon.spy(this.currentTest, 'handler');

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('SET');
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending SET with 1 parameters should return an error', (done) => {
      this.currentTest.handler = (data) => {
        if (this.currentTest.handler.callCount > 0) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];
          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ERROR Expected format is: SET <word> <desc>');

          done();
        }
      };

      sinon.spy(this.currentTest, 'handler');

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('SET potato');
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending GET after a SET should return a proper word', (done) => {
      this.currentTest.handler = (data) => {
        if (this.currentTest.handler.callCount === 1) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];

          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ANSWER Word potato has been set.');
          this.currentTest.client.write('GET potato');
        }

        if (this.currentTest.handler.callCount === 2) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];

          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ANSWER Potato is a word.');
          done();
        }
      };

      sinon.spy(this.currentTest, 'handler');

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.write('SET potato Potato is a word.');
      this.currentTest.client.on('data', this.currentTest.handler);
    });

    it('sending ALL after multiple GET should return all words', (done) => {
      this.currentTest.handler = (data) => {
        if (this.currentTest.handler.callCount === 1) {
          this.currentTest.client.write('SET banana Banana is a word.');
        }

        if (this.currentTest.handler.callCount === 2) {
          this.currentTest.client.write('SET tomato Tomato is a word.');
        }

        if (this.currentTest.handler.callCount === 3) {
          this.currentTest.client.write('ALL');
        }

        if (this.currentTest.handler.callCount === 4) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];

          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ANSWER Available words: potato, banana, tomato.');
          done();
        }
      };

      sinon.spy(this.currentTest, 'handler');

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.on('data', this.currentTest.handler);

      this.currentTest.client.write('SET potato Potato is a word.');
    });

    it('sending a wrong command, the server should handle it', (done) => {
      this.currentTest.handler = (data) => {
        if (this.currentTest.handler.callCount === 1) {
          this.currentTest.client.write('CLEAR');
        }

        if (this.currentTest.handler.callCount === 2) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];

          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ANSWER The dictionary has been cleared.');

          this.currentTest.client.write('ALL');
        }

        if (this.currentTest.handler.callCount === 3) {
          const temp = data.toString('utf-8').split('\r\n');
          const expMsg = temp[temp.length - 3];

          expect(expMsg).to.be.a('string');
          expect(expMsg).to.equal('ERROR There are no words saved.');

          done();
        }
      };

      sinon.spy(this.currentTest, 'handler');

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.on('data', this.currentTest.handler);

      this.currentTest.client.write('SET potato Potato is a word.');
    });

    it('sending CLEAR should clear the dictionary', (done) => {
      this.currentTest.handler = (data) => {
        const temp = data.toString('utf-8').split('\r\n');
        const expMsg = temp[temp.length - 3];

        expect(expMsg).to.be.a('string');
        expect(expMsg).to.equal('ERROR Command not found.');

        done();
      };

      this.currentTest.client.connect(clientConfig);
      this.currentTest.client.on('data', this.currentTest.handler);

      this.currentTest.client.write('NOCOMMAND');
    });
  });
});
