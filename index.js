const net = require('net');
const colors = require('colors/safe');

// ENVVARs.
const socketPort = process.env.PORT || 8124;

// Utils.
const serverStr = colors.yellow('[SERVER]');
const clientStr = colors.green('[CLIENT]');

// Creating the server.
const server = net.createServer((tcpSocket) => {
  // Notifications.
  const clientIdStr = `(${tcpSocket.remoteAddress}:${tcpSocket.remotePort})`;
  console.log(`${clientStr} ${clientIdStr} connected.`);
  tcpSocket.write('Sucessful connection.\n');

  // Handle connection closed.
  tcpSocket.on('end', () => {
    console.log(`${clientStr} ${clientIdStr} disconnected.`);
  });

  // Handle data.
  tcpSocket.on('data', (dataSent) => {
    console.log(`${clientStr} Data received from ${clientIdStr}.`);

    console.log(dataSent.toString('utf-8'));

    tcpSocket.write(`You sent this: ${dataSent.toString('utf-8')}`);
  });


});

// Binding and starting the server.
server.listen(socketPort, '127.0.0.1', 1, () => {
  console.log(`${serverStr} Connected. Listening on ${socketPort}.`)
});