module.exports = class TCPSocket {
  internal; addr; port;

  constructor(socket) {
    this.internal = socket;
    this.addr = this.internal.remoteAddress;
    this.port = this.internal.remotePort;
  }
}