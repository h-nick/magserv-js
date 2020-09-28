const net = require('net');
const colors = require('colors/safe');

// ENVVARs.
const socketPort = process.env.PORT || 8124;

// Utils.
const serverString = colors.yellow('[SERVER]');
const clientString = colors.green('[CLIENT]');

// Creating the server.
const server = net.createServer((tcpSocket) => {
  console.log(`${clientString} Client connected.`);

  tcpSocket.write('Sucessful connection.\n');

  const cTimer = setInterval(() => {
    tcpSocket.write('Are you still there?\n');
  }, 5000);

  tcpSocket.on('end', () => {
    console.log(`${clientString} Client disconnected.`);
    clearInterval(cTimer);
  });
});

// Binding and starting the server.
server.listen(socketPort, '127.0.0.1', 1, () => {
  console.log(`${serverString} Connected. Listening on ${socketPort}.`)
});