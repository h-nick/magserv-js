const net = require('net');

// ENVVARs.
const socketPort = process.env.PORT || 8124;

// Creating the server.
const server = net.createServer((tcpSocket) => {
  console.log('Client connected.');

  tcpSocket.write('Sucessful connection.\n');

  const cTimer = setInterval(() => {
    tcpSocket.write('Are you still there?\n');
  }, 5000);

  tcpSocket.on('end', () => {
    console.log('Client disconnected.');
    clearInterval(cTimer);
  });
});

// Binding and starting the server.
server.listen(socketPort, '127.0.0.1', 1, () => {
  console.log(`Established. Listening on ${socketPort}`)
});