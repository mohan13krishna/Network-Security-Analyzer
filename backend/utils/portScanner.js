const net = require('net');

const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3389];

module.exports = function portScanner(hostname) {
  const openPorts = [];

  const scanPort = (port) => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);

      socket.on('connect', () => {
        openPorts.push(port);
        socket.destroy();
        resolve();
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve();
      });

      socket.on('error', () => {
        resolve();
      });

      socket.connect(port, hostname);
    });
  };

  return Promise.all(commonPorts.map(scanPort)).then(() => openPorts);
};
