const net = require('net');
const colors = require('colors/safe');
const TCPSocket = require('./tcp_socket');

module.exports = class HttpServer {
  #host;

  #port;

  #responses = new Map();

  #server;

  #str = {
    server: colors.yellow('[SERVER]'),
    client: colors.brightRed('[CLIENT]'),
  };

  constructor(host = '127.0.0.1', port = 8124) {
    this.#host = process.env.HOST || host;
    this.#port = process.env.PORT || port;
  }

  close = () => {
    this.#server.close(() => console.log('All connections finished. Bye!'));
  }

  #endHandler = (socket) => {
    try {
      socket.internal.write('Finished. Bye!\r\n');
      socket.internal.destroy();
    } catch (error) {
      console.log(error);
    }

    console.log(`${this.#str.client} (${socket.addr}:${socket.port}) disconnected.`);
  }

  #cmdGet = (word) => this.#responses.get(word)

  #cmdSet = (word, desc) => this.#responses.set(word, desc)

  #cmdClear = () => {
    this.#responses.clear();
  }

  #cmdAll = () => {
    const tmpArr = Array.from(this.#responses.keys());

    return tmpArr.join(', ');
  }

  #dataHandler = (socket, data) => {
    console.log(`${this.#str.client} (${socket.addr}:${socket.port}) sent data.`);

    const stringMatch = data.toString('utf-8').match(/[^\s]+/g);

    if (!stringMatch) {
      socket.internal.write('ERROR A command was expected.\r\n');
      return;
    }

    switch (stringMatch[0]) {
      case 'GET': {
        if (!stringMatch[1]) {
          socket.internal.write('ERROR Expected format is: GET <word>.\r\n');
          break;
        }

        const rVal = this.#cmdGet(stringMatch[1]);

        if (rVal) {
          socket.internal.write(`ANSWER ${rVal}\r\n`);
        } else {
          socket.internal.write('ERROR Could not find the specified word.\r\n');
        }
        break;
      }

      case 'SET': {
        const extraParam = stringMatch.slice(2).join(' ');

        if (!stringMatch[1] || !extraParam) {
          socket.internal.write('ERROR Expected format is: SET <word> <desc>\r\n');
          break;
        }

        this.#cmdSet(stringMatch[1], extraParam);
        socket.internal.write(`ANSWER Word ${stringMatch[1]} has been set.\r\n`);
        break;
      }

      case 'CLEAR': {
        this.#cmdClear();
        socket.internal.write('ANSWER The dictionary has been cleared.\r\n');
        break;
      }

      case 'ALL': {
        const words = this.#cmdAll();

        if (words) {
          socket.internal.write(`ANSWER Available words: ${words}.\r\n`);
        } else {
          socket.internal.write('ERROR There are no words saved.\r\n');
        }
        break;
      }

      default:
        socket.internal.write('ERROR Command not found.\r\n');
    }

    socket.internal.write('---------------\r\n');
  }

  #tcpHandler = (client) => {
    const socket = new TCPSocket(client);
    console.log(`${this.#str.client} (${socket.addr}:${socket.port}) connected.`);

    socket.internal.write('Successful connection.\r\n');
    socket.internal.write('Available commands: GET, SET, CLEAR, ALL.\r\n');

    socket.internal.on('end', () => this.#endHandler(socket));
    socket.internal.on('data', (data) => this.#dataHandler(socket, data));
  }

  #listen = () => {
    this.#server.listen(this.#port, this.#host, 1, () => {
      console.log(`${this.#str.server} Connected. Listening on ${this.#host}:${this.#port}.`);
    });
  }

  init = (listener = this.#tcpHandler) => {
    console.log(colors.yellow(`Initializing TCP server on port ${this.#port}...`));

    this.#server = net.createServer({ allowHalfOpen: true }, listener);
    this.#listen();
    return this.#server;
  }
};
