const tls = require('tls');

module.exports = function sslScanner(hostname) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      servername: hostname
    }, () => {
      try {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        socket.end();

        resolve({
          valid_from: cert.valid_from,
          valid_to: cert.valid_to,
          subject: cert.subject,
          issuer: cert.issuer,
          protocol,
        });
      } catch (err) {
        reject(err);
      }
    });

    socket.on('error', (err) => {
      reject(new Error('TLS connection failed: ' + err.message));
    });
  });
};
