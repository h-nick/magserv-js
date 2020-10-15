const net = require('net');
const colors = require('colors/safe');
const { TCPSocket } = require('./tcp_socket');

/**
 * @class
 * @classdesc HTTPServer is a custom implementation of a server to handle the HTTP protocol.
 * It implements native TCP sockets through Node's Net class.
 */
class HttpServer {
  /**
   * @private
   * @description Holds the local IP address.
   */
  #host;

  /**
   * @private
   * @description Holds the local port number.
   */
  #port;

  /**
   * @private
   * @description Holds the server instance.
   */
  #server;

  /**
   * @private
   * @description Holds colored text to be used in console logs.
   */
  #str = {
    server: colors.yellow('[SERVER]'),
    client: colors.brightRed('[CLIENT]'),
  };

  /**
   * @function
   * @param {String} [host="127.0.0.1"] - Local address where the server will be run from.
   * @param {Number} [port=8124] - Local port where the server will be run from.
   * @returns {Object} A new HTTPServer instance.
   * @example
   * // Initializing a new server instance.
   * const server = new HTTPServer();
   * server.init();
   */
  constructor(host = '127.0.0.1', port = 8124) {
    this.#host = process.env.HOST || host;
    this.#port = process.env.PORT || port;
  }

  /**
   * @function
   * @description Closes the server connection and disconnects all sockets.
   * @returns {Void} N/A
   */
  close = () => {
    this.#server.close(() => console.log('All connections finished. Bye!'));
  }

  /**
   * @private
   * @function
   * @description This function gets called once the socket half-closes the TCP connection.
   * @param {Object} socket - The object representing the connected socket.
   * It should be passed by the appropriate event listener.
   * @return {Void} N/A
   */
  #endHandler = (socket) => {
    try {
      socket.internal.write('Finished. Bye!\r\n');
      socket.internal.destroy();
    } catch (error) {
      console.log(error);
    }

    console.log(`${this.#str.client} (${socket.addr}:${socket.port}) disconnected.`);
  }

  /**
   * @private
   * @function
   * @description Manually destroys the socket connection without triggering the
   * end event handler.
   * @param {Object} socket - The object representing the connected socket.
   * @return {Void} N/A
   */
  #endConnection = (socket) => {
    try {
      socket.internal.destroy();
      console.log(`${this.#str.server} (${socket.addr}:${socket.port}) connection closed.`);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @private
   * @function
   * @description Gets the entry line in an HTTP request.
   * @param {String[]} stringData - The array of strings containing the HTTP request.
   * It should be passed down by the appropriate method.
   * @return {String[]} Returns an array of strings containing the HTTP request
   * method, resource and version.
   */
  #getEntryLine = (stringData) => stringData[0].split(' ');

  /**
   * @private
   * @function
   * @description Gets the headers from the HTTP request.
   * @param {String[]} stringData - The array of strings containing the HTTP request.
   * It should be passed down by the appropriate method.
   * @return {Object} Returns an object with all the headers.
   * Non-valid headers are parsed out.
   */
  #getHeaders = (stringData) => {
    const headersArray = stringData.slice(1, stringData.findIndex((e) => !e));
    const headers = {};

    /* eslint-disable-next-line no-restricted-syntax */
    for (const header of headersArray) {
      const [key, val] = header.split(': ');
      headers[key] = val;
    }

    return headers;
  }

  /**
   * @private
   * @function
   * @description Handles the request sent from the client.
   * A valid HTTP request must be sent for it to be handled, otherwise an ERROR message
   * will be sent to the client.
   * @param {Object} socket - The object representing the connected socket.
   * It should be passed by the appropriate event listener.
   * @param {Buffer} data - The request received by the server.
   * @return {Void} N/A
   */
  #dataHandler = (socket, data) => {
    try {
      const stringData = data.toString('utf-8').split('\r\n');
      const [method, resource, version] = this.#getEntryLine(stringData);
      const headers = this.#getHeaders(stringData);

      if (!method || !resource || !version) {
        socket.internal.write('ERROR Method, Resource or Version missing from request.\r\n');
        return;
      }

      switch (method) {
        case 'GET': {
          socket.internal.write(
            `ANSWER ${method} ${resource} ${version}\r\n`,
          );
          break;
        }
        default:
          socket.internal.write('ERROR Non-valid request.\r\n');
      }

      console.log(`${this.#str.client} (${socket.addr}:${socket.port}) sent data.`);
    } catch (error) {
      console.log(
        colors.brightRed(`(${socket.addr}:${socket.port}) d/c on data listener.`),
      );
      console.log(error);
    }
  }

  /**
   * @private
   * @function
   * @description Creates a new TCPSocket instance and sets up the event listeners.
   * @param {Object} client - The object representing the connected socket.
   * It should be passed by the appropriate event listener.
   * @return {Void} N/A
   */
  #tcpHandler = (client) => {
    const socket = new TCPSocket(client);
    console.log(`${this.#str.client} (${socket.addr}:${socket.port}) connected.`);

    socket.internal.on('end', () => this.#endHandler(socket));
    socket.internal.on('data', (data) => this.#dataHandler(socket, data));
  }

  /**
   * @private
   * @function
   * @description Sets up the TCP listener for the server.
   * @return {Void} N/A
   */
  #listen = () => {
    this.#server.listen(this.#port, this.#host, 1, () => {
      console.log(`${this.#str.server} Connected. Listening on ${this.#host}:${this.#port}.`);
    });
  }

  /**
   * @function
   * @description Starts up the server.
   * @param {Function} [listener=#tcpHandler] - The callback to handle new connections.
   * @return {Object} The server instance.
   */
  init = (listener = this.#tcpHandler) => {
    console.log(colors.yellow(`Initializing TCP server on port ${this.#port}...`));

    this.#server = net.createServer({ allowHalfOpen: true }, listener);
    this.#listen();
    return this.#server;
  }
}

module.exports = { HttpServer };
