/**
 * @class
 * @classdesc TCPSocket is a wrapper around the native Net.Socket class.
 */
class TcpSocket {
  /**
   * @description Holds the actual socket of the instance.
   */
  internal;

  /**
   * @description Holds the socket remote address.
   */
  addr;

  /**
   * @description Holds the socket remote port number.
   */
  port;

  /**
   * @function
   * @param {Object} socket - The Net.Socket instance.
   */
  constructor(socket) {
    this.internal = socket;
    this.addr = this.internal.remoteAddress;
    this.port = this.internal.remotePort;
  }
}

module.exports = { TcpSocket };
