const net = require('net');

// ENVVARs.
const socketPort = process.env.PORT || 8124;

// Creating the server.
const server = net.createServer(() => {
  console.log('Client connected.');
});

// Binding and starting the server.
server.listen(socketPort, '127.0.0.1', 1, () => {
  console.log(`Established. Listening on ${socketPort}`)
});