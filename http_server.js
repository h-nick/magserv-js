const net = require('net');
const colors = require('colors/safe');
const TCPSocket = require('./tcp_socket');

module.exports = class HttpServer {
  #host;
  #port;
  #str = {
    server: colors.yellow('[SERVER]'),
    client: colors.brightRed('[CLIENT]')
  };

  constructor(host = '127.0.0.1', port = 8124) {
    this.#host = process.env.HOST || host;
    this.#port = process.env.PORT || port;
  }

  #endHandler = (socket) => {
    console.log(
      `${this.#str.client} (${socket.addr}:${socket.port}) disconnected.`
    );
  }

  #dataHandler = (socket, data) => {
    console.log(
      `${this.#str.client} Data received from (${socket.addr}:${socket.port}).`
    );

    socket.internal.write(`You sent this: ${data.toString('utf-8')}`);
  }

  #tcpHandler = (client) => {
    const socket = new TCPSocket(client);
    console.log(`${this.#str.client} (${socket.addr}:${socket.port}) connected.`);

    socket.internal.write('Sucessful connection.\n');

    socket.internal.on('end', () => this.#endHandler(socket));
    socket.internal.on('data', (data) => this.#dataHandler(socket, data));
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