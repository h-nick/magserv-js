module.exports = class TCPSocket {
  #dataQueue = [];
  internal; addr; port;

  constructor(socket) {
    this.internal = socket;
    this.addr = this.internal.remoteAddress;
    this.port = this.internal.remotePort;
  }

  addData = (data) => {
    this.#dataQueue.push(data);
  }

  getDataPiece = () => {
    return this.#dataQueue.shift();
  }
}