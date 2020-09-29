const net = require('net');
const colors = require('colors/safe');

module.exports = class HttpServer {
  #host;
  #port;
  #str = {
    server: colors.yellow('[SERVER]'),
    client: colors.green('[CLIENT]')
  };

  constructor(host = '127.0.0.1', port = 8124) {
    this.#host = process.env.HOST || host;
    this.#port = process.env.PORT || port;
  }

  #endHandler = (socket) => {
    console.log(`(${socket.remoteAddress}:${socket.remotePort}) disconnected.`);
  }

  #dataHandler = (socket, data) => {
    console.log(
      `${this.#str.client} Data received from (${socket.remoteAddress}:${socket.remotePort}).`
    );

    console.log(data);

    socket.write(`You sent this: ${data.toString('utf-8')}`);
  }

  #tcpHandler = (socket) => {
    console.log(`${this.#str.client} (${socket.remoteAddress}:${socket.remotePort}) connected.`);
    socket.write('Sucessful connection.\n');

    socket.on('end', () => this.#endHandler(socket));

    socket.on('data', (data) => this.#dataHandler(socket, data));
  }

  #listen = (server) => {
    server.listen(this.#port, this.#host, 1, () => {
      console.log(`${this.#str.server} Connected. Listening on ${this.#host}:${this.#port}.`)
    });
  }

  init = (listener = this.#tcpHandler) => {
    console.log(colors.yellow(`Initializing TCP server on port ${this.#port}...`));

    const server = net.createServer(listener);
    this.#listen(server);
    return server;
  }
}